function getDefaultPlayer() {
    return {
        lastUpdate: new Date().getTime(),
        atom: new Decimal(0),
        storyId: 0,
        mergeTime: 0,
        mergeInterval: 1,
        mergePower: new Decimal(1),
        particle: new Decimal(0),
        particleCap: new Decimal(20),
        particleCreatePower: new Decimal(2),
        particleAtomRatio: new Decimal(3),
        itemAmounts: {
          building: [new Decimal(0), new Decimal(0), new Decimal(0)],
          upgrade: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
          exp: [new Decimal(0)]
        },
        itemCosts: {
          building: [new Decimal(20), new Decimal(100), new Decimal(2e4)],
          upgrade: [new Decimal(50), new Decimal(200), new Decimal(1e3), new Decimal(1), new Decimal(2)],
          exp: [new Decimal(100)]
        },
        itemPowers: {
          building: [new Decimal(0.5), new Decimal(3), new Decimal(50)],
          upgrade: [new Decimal(2), new Decimal(10), new Decimal(0), new Decimal(0.5), new Decimal(0)],
          exp: [new Decimal(0)]
        },
        itemCostScales: {
          building: [new Decimal(1.1), new Decimal(1.2), new Decimal(1.3)],
          upgrade: [new Decimal(2.5), new Decimal(50), new Decimal(1), new Decimal(2), new Decimal(1)],
          exp: [new Decimal(1)]
        },
        itemAmountCaps: {
          building: [new Decimal(-1), new Decimal(-1), new Decimal(-1)],
          upgrade: [new Decimal(-1), new Decimal(-1), new Decimal(1), new Decimal(4), new Decimal(1)],
          exp: [new Decimal(-1)]
        },
        molecule: new Decimal(0),
        moleculeGained: new Decimal(0),
        expSpendPercent: 0,
        expParticleSpent: new Decimal(0),
        expCurrentId: -1,
        crankSpeed: new Decimal(0),
        crankSpeedCap: new Decimal(100),
        crankSpinPower: new Decimal(5),
        crankSlowdownRate: new Decimal(10),
        crankSpeedDelta: new Decimal(0),
        crankMaxDelta: new Decimal(50),
        version: 9
    }
}

let diffMultiplier = 1 // The infamous cheating variable from Nyan Cat
let gameLoopIntervalId = 0
var player = getDefaultPlayer()
let prologueAtom = new Decimal("9e79")
let prologueGenActivated = false
let storyTexts = ["Your Universe was rapidly decaying.",
                  "To combat this, your crew created a pocket dimension to escape to when necessary.",
                  "But soon enough, you realize..",
                  "You're taking part in the Universe's final moments.",
                  "And it all starts with this generator.",
                  "SYSTEM: The sum of all matter produced in the universe has surpassed the maximum threshold. Universal collapse in estimated ten seconds.",
                  "The Beginning.",
                  "Building unlocked.",
                  "Upgrades unlocked.",
                  "Tier 1 unlocked.",
                  "Experiments unlocked.",
                  "Tier 2 unlocked.",
                  "Cranks unlocked, end of content."]
let existingTabNames = ["generator","buildings","upgrades","exp","cranks","lore","options"]
let currentTab = "buildings"

setOnclick("storyNext", function() {
    player.storyId = Math.min(4,player.storyId+1)
    updateTabDisplay()
})
setOnclick("genActivateBtn", function() {
    if (player.storyId < 4) return;
    updateElement("genActivateBtn", "ACTIVATED")
    prologueGenActivated = true
})
setOnclick("particleClickGain",createParticle)
getElement("expSpendPercent").oninput = function() {
  player.expSpendPercent = this.value
}

function startInterval() {
  gameLoopIntervalId = setInterval(gameLoop, 10)
}

function exportGame() {
    copyStringToClipboard(btoa(JSON.stringify(player)))
    alert("Exported to clipboard")
}

function importGame() {
    loadGame(prompt("Please paste your exported save below:"),true)
}

function hardReset(forced = false) {
    if (forced || confirm("Are you sure about reset ALL of your progress?")) {
        if (forced || confirm("Do you REALLY sure? This is the LAST confirmation!")) {
            player = getDefaultPlayer()
            saveGame()
            location.reload()
        }
    }
}

function startGame() {
  let savefile = localStorage.getItem(saveName)
  if (!(savefile === null)) loadGame(savefile)
  else onLoad()
  startInterval()
  setInterval(saveGame,5000)
}

function endPrologue() {
  player.storyId = Math.min(6,player.storyId+1)
  changeTab("buildings")
}

function changeTab(tabName) {
    currentTab = tabName
    updateTabDisplay()
}

function updateTabDisplay() {
    existingTabNames.forEach(function(name) {
        let toDisplay = name==currentTab && getElement(`${name}TabBtn`).style.display==="" && player.storyId>=4
        decideElementDisplay(`${name}Tab`, toDisplay)
        getElement(`${name}TabBtn`).childNodes[0].classList.toggle("active", toDisplay)
    })
}

function skipPrologue() {
  player.storyId = Math.max(6, player.storyId)
}

function createParticle() {
  let addAmount = Decimal.min(player.particleCap.sub(player.particle),player.particleCreatePower)
  player.particle = player.particle.plus(addAmount)
}

function checkMilestone() {
  switch (player.storyId) {
    case 6:
      if (player.atom.gte(20)) player.storyId++
      updateTabDisplay()
      break;
    case 7:
      if (player.atom.gte(50)) player.storyId++
      break;
    case 8:
      if (player.atom.gte(100)) player.storyId++
      break;
    case 9:
      if (player.itemAmounts.upgrade[2].neq(0)) player.storyId++
      break;
    case 10:
      if (player.atom.gte(1e4)) player.storyId++
      break;
    case 11:
      if (player.itemAmounts.upgrade[4].gt(0)) player.storyId++
      break;
    default:
      return;
  }
}

function particlePerSec(total = false) {
  let ret = new Decimal(0)
  for (i=0;i<player.itemAmounts.building.length;i++) {
    ret = ret.plus(player.itemAmounts.building[i].times(player.itemPowers.building[i]))
  }
  ret = ret.times(getCrankBoost())
  if (total) return ret
  if (player.expCurrentId == -1) return [ret, new Decimal(0)]
  return [ret.times(1-(player.expSpendPercent/100)), ret.times(player.expSpendPercent/100)]
}

function getCurrentTier() {
    switch (player.storyId) {
        case 7:
        case 8:
          return 0;
        case 9:
        case 10:
          return 1;
        case 11:
        case 12:
        case 13:
          return 2;
        default:
          return -1;
    }
}

function canBuyItem(id, type) {
  switch (type) {
    case "building":
      return player.atom.gte(Decimal.ceil(player.itemCosts.building[id]))
    case "upgrade":
      return player[getItemCostCurrencyName(type, id)].gte(Decimal.ceil(player.itemCosts.upgrade[id])) && player.itemAmounts.upgrade[id].neq(player.itemAmountCaps.upgrade[id])
    default:
      return false
  }
}

function buyItem(id, type) {
  if (type == "building" && getCurrentTier()<id) return;
  let currency = getItemCostCurrencyName(type, id)
  if (canBuyItem(id, type)) {
    player.itemAmounts[type][id] = player.itemAmounts[type][id].plus(1)
    player[currency] = player[currency].sub(Decimal.ceil(player.itemCosts[type][id]))
    player.itemCosts[type][id] = player.itemCosts[type][id].times(player.itemCostScales[type][id])
    if (type == "upgrade") updateUpgradeEffect(id)
  }
}

function getBuildingState(id) {
    if (getCurrentTier() < id) return "Locked"
    if (player.atom.lt(Decimal.ceil(player.itemCosts.building[id]))) return "Can't afford"
    return "Buy"
}

function resetValues(names) {
    let reference = getDefaultPlayer()
    names.forEach(function(name) {
        eval(`player.${name} = reference.${name}`) // Familiar?
    })
}

function refreshItems() {
    resetValues(["itemCosts","itemPowers","itemCostScales","itemAmountCaps"])
    Object.keys(player.itemCosts).forEach(function(itemType) {
        for (let i=0;i<player.itemCosts[itemType].length;i++) {
            if (typeof player.itemAmounts[itemType][i] != "object") player.itemAmounts[itemType][i] = new Decimal(0)
            else player.itemCosts[itemType][i] = player.itemCosts[itemType][i].times(Decimal.pow(player.itemCostScales[itemType][i],player.itemAmounts[itemType][i]))
        }
    })
}

function updateLoreDisplay() {
  let loreText = player.storyId>=6?storyTexts.slice(6,player.storyId+1).join("<br><br>"):"How did you get here?"
  getElement("loreDisplay").innerHTML = loreText
}

function updateAllDisplay() {
  updateItemTable("building")
  updateItemTable("upgrade")
  updateItemTable("exp")
  updateCrankSpeedBar()
  updateLoreDisplay()
  updateDisposePercent()
  let temp = player.mergeInterval-player.mergeTime
  updateElement("timeTillNextAtom", temp<=0?"any":shortenMoney(temp))
  updateElement("atomCount", `You have ${shortenMoney(player.storyId<=5?prologueAtom:player.atom)} Atoms`)
  updateElement("storyDisplay", storyTexts[player.storyId])
  updateElement("particle", shortenMoney(player.particle))
  updateElement("particleCap", shortenMoney(player.particleCap))
  updateElement("particleClickGain", `Create ${shortenMoney(player.particleCreatePower)} Particles`)
  updateElement("moleculeAmount", shortenMoney(player.molecule))
  // updateElement("moleculeNextReqDisplay", shortenMoney(player.moleculeNextReq))
  updateElement("crankSpeedDisplay", shortenMoney(player.crankSpeed))
  updateElement("crankBoostDisplay", shortenMoney(getCrankBoost()))
  updateElement("particlePerSecDisplay", shortenMoney(particlePerSec(true)))
  updateElement("expStat", getExpStat())
  decideElementDisplay("tabBtnContainer", player.storyId>=4)
  decideElementDisplay("storyNext", player.storyId<4)
  decideElementDisplay("atomCountContainer", player.storyId>=6)
  decideElementDisplay("particleClickGainContainer", player.storyId>=6)
  decideElementDisplay("expTabBtn", player.itemAmounts.upgrade[2].neq(0))
  decideElementDisplay("generatorTabBtn", player.storyId<6)
  decideElementDisplay("buildingsTabBtn", player.storyId>=6)
  decideElementDisplay("loreTabBtn", player.storyId>=6)
  decideElementDisplay("particlePerSecDisplayContainer", particlePerSec(true).gt(0))
  decideElementDisplay("upgradesTabBtn", player.storyId>=8)
  decideElementDisplay("moleculeDisplayContainer", player.moleculeGained.neq(0))
  decideElementDisplay("cranksTabBtn", player.itemAmounts.upgrade[4].neq(0))
  decideElementDisplay("crankEffectDisplayContainer", player.itemAmounts.upgrade[4].neq(0))
}

function getArrayTypeList() {
  let ret = {};
  ["building","upgrade","exp"].forEach(function(itemType) {
    ["itemAmounts","itemCosts","itemPowers","itemCostScales","itemAmountCaps"].forEach(function(itemProperty) {
      ret[`${itemProperty}.${itemType}`] = "Decimal"
    })
  })
  return ret
}

function gameLoop(diff) { // 1 diff = 0.001 seconds
  // Diff handle
  var thisUpdate = new Date().getTime()
  if (typeof diff === 'undefined') var diff = Math.min(thisUpdate - player.lastUpdate, 21600000);
  diff *= diffMultiplier
  if (diffMultiplier > 1) console.log("SHAME")
  else if (diffMultiplier < 1) console.log("SLOWMOTION")

  // Prologue Atom handle
  if (player.storyId == 4 && prologueGenActivated) prologueAtom = prologueAtom.plus(new Decimal("2e78").times(diff/1000))
  if (player.storyId == 4 && prologueAtom.gte(new Decimal("1e80"))) {
    player.storyId = 5
    prologueAtom = new Decimal("1e80")
  }
  if (player.storyId == 5) {
    if (prologueAtom.lte(0.5)) endPrologue()
    prologueAtom = Decimal.pow10(prologueAtom.log10()-0.008*diff)
  }

  // Particle and Atom Merger handle
  if (player.storyId > 5) {
    player.particle = player.particle.plus(particlePerSec()[0].times(diff).div(1000))
    player.mergeTime += diff*0.001
    if (player.particle.lt(player.particleAtomRatio)) {
      player.mergeTime = 0
    } else if (player.mergeTime>=player.mergeInterval) {
      let atomToAdd = Decimal.floor(Decimal.min(player.particle.div(player.particleAtomRatio), player.mergePower.times(player.mergeTime/player.mergeInterval)))
      player.mergeTime = Math.max(0, player.mergeTime-player.mergeInterval*atomToAdd)
      player.particle = player.particle.sub(atomToAdd.times(player.particleAtomRatio))
      player.atom = player.atom.plus(atomToAdd)
    }
    player.particle = Decimal.min(player.particleCap, player.particle)
    checkMilestone()
  }

  // Exp handle
  if (player.expCurrentId != -1) {
    player.expParticleSpent = player.expParticleSpent.plus(particlePerSec()[1].times(diff).div(1000))
    if (player.expParticleSpent.gte(player.itemCosts.exp[player.expCurrentId])) {
      player.expParticleSpent = new Decimal(0)
      player.itemAmounts.exp[player.expCurrentId] = player.itemAmounts.exp[player.expCurrentId].plus(1)
      player.expCurrentId = -1
    }
  }

  // Crank speed handle
  if (player.storyId>=12) {
    player.crankSpeedDelta = player.crankSpeedDelta.minus(player.crankSlowdownRate.div(1000).times(diff))
    player.crankSpeed = Decimal.min(player.crankSpeedCap, Decimal.max(new Decimal(0), player.crankSpeed.plus(player.crankSpeedDelta.div(1000).times(diff))))
    if (player.crankSpeed.eq(0)) player.crankSpeedDelta = new Decimal(0)
  }

  // Finishing up
  updateAllDisplay()
  player.lastUpdate = thisUpdate
}
