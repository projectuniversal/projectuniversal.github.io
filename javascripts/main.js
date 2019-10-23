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
        atomMoleculeRatio: new Decimal(1e4),
        itemAmounts: {
          building: [new Decimal(0), new Decimal(0), new Decimal(0)],
          upgrade: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
          research: [new Decimal(0)],
          discover: [new Decimal(0)]
        },
        itemCosts: {
          building: [new Decimal(20), new Decimal(100), new Decimal(2e4)],
          upgrade: [new Decimal(50), new Decimal(200), new Decimal(1e3), new Decimal(1), new Decimal(2), new Decimal(5e4)],
          research: [new Decimal(1e4)],
          discover: [new Decimal(1)]
        },
        itemPowers: {
          building: [new Decimal(0.5), new Decimal(3), new Decimal(50)],
          upgrade: [new Decimal(2), new Decimal(10), new Decimal(0), new Decimal(0.5), new Decimal(0), new Decimal(0)],
          research: [new Decimal(0)],
          discover: [new Decimal(0)]
        },
        itemCostScales: {
          building: [new Decimal(1.1), new Decimal(1.2), new Decimal(1.3)],
          upgrade: [new Decimal(2.5), new Decimal(50), new Decimal(1), new Decimal(2), new Decimal(1), new Decimal(1)],
          research: [new Decimal(1)],
          discover: [new Decimal(1)]
        },
        itemAmountCaps: {
          building: [new Decimal(-1), new Decimal(-1), new Decimal(-1)],
          upgrade: [new Decimal(-1), new Decimal(-1), new Decimal(1), new Decimal(4), new Decimal(1), new Decimal(1)],
          research: [new Decimal(1)],
          discover: [new Decimal(1)]
        },
        moleculeMergerOn: false,
        moleculeMergerTime: 0,
        molecule: new Decimal(0),
        moleculeGained: new Decimal(0),
        researchSpendPercent: 0,
        researchParticleSpent: new Decimal(0),
        researchCurrentId: -1,
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
                  "Research unlocked.",
                  "Tier 2 unlocked.",
                  "Cranks unlocked, end of content."]
let existingTabNames = ["generator","buildings","merger","upgrades","research","cranks","lore","options"]
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
setOnclick("moleculeMergerBtn",moleculeMergerActivate)
getElement("researchSpendPercent").oninput = function() {
  player.researchSpendPercent = this.value
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
  if (player.researchCurrentId == -1) return [ret, new Decimal(0)]
  return [ret.times(1-(player.researchSpendPercent/100)), ret.times(player.researchSpendPercent/100)]
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
      return player[itemCostCurrencyNameFunc[type](id)].gte(Decimal.ceil(player.itemCosts.upgrade[id])) && player.itemAmounts.upgrade[id].neq(player.itemAmountCaps.upgrade[id])
    case "discover":
      return player[itemCostCurrencyNameFunc[type](id)].gte(Decimal.ceil(player.itemCosts.discover[id])) && player.itemAmounts.discover[id].neq(player.itemAmountCaps.discover[id])
    default:
      return false
  }
}

function buyItem(id, type) {
  if (type == "building" && getCurrentTier()<id) return;
  let currency = itemCostCurrencyNameFunc[type](id)
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
  let loreText = player.storyId>=6?storyTexts.slice(6,player.storyId+1).reverse().join("<br><br>"):"How did you get here?"
  getElement("loreDisplay").innerHTML = loreText
}

function updateAllItemTable() {
  updateItemTable("building")
  updateItemTable("upgrade")
  updateItemTable("research")
  updateItemTable("discover")
}

function updateHUD() {
  let temp = player.mergeInterval-player.mergeTime
  updateElement("timeTillNextAtom", temp<=0?"any":shortenMoney(temp))
  updateElement("atomCount", `You have ${shortenMoney(player.storyId<=5?prologueAtom:player.atom)} Atoms`)
  updateElement("storyDisplay", storyTexts[player.storyId])
  updateElement("particle", shortenMoney(player.particle))
  updateElement("particleCap", shortenMoney(player.particleCap))
  updateElement("particleClickGain", `Create ${shortenMoney(player.particleCreatePower)} Particles`)
  updateElement("moleculeAmount", shortenMoney(player.molecule))
  updateElement("crankSpeedDisplay", shortenMoney(player.crankSpeed))
  updateElement("crankBoostDisplay", shortenMoney(getCrankBoost()))
  updateElement("particlePerSecDisplay", shortenMoney(particlePerSec(true)))
  decideElementDisplay("storyNext", player.storyId<4)
  decideElementDisplay("atomCountContainer", player.storyId>=6)
  decideElementDisplay("particleClickGainContainer", player.storyId>=6)
  decideElementDisplay("particlePerSecDisplayContainer", particlePerSec(true).gt(0))
  decideElementDisplay("moleculeDisplayContainer", player.moleculeGained.neq(0))
  decideElementDisplay("crankEffectDisplayContainer", player.itemAmounts.upgrade[4].neq(0))
  decideElementDisplay("moleculeMergerBtn", player.itemAmounts.upgrade[5].neq(0))
  updateElement("moleculeMergerBtn", player.moleculeMergerOn?`Merging... ${player.moleculeMergerTime.toFixed(1)}/10 sec`:"Make 1 molecule with 1e4 Atoms")
}

function updateTabBtnDisplay() {
  decideElementDisplay("researchTabBtn", player.itemAmounts.upgrade[2].neq(0))
  decideElementDisplay("generatorTabBtn", player.storyId<6)
  decideElementDisplay("buildingsTabBtn", player.storyId>=6)
  decideElementDisplay("loreTabBtn", player.storyId>=6)
  decideElementDisplay("mergerTabBtn", player.itemAmounts.discover[0].gt(0))
  decideElementDisplay("upgradesTabBtn", player.storyId>=8)
  decideElementDisplay("cranksTabBtn", player.itemAmounts.upgrade[4].neq(0))
}

function updateTabContent(tab) {
  switch (tab) {
    case "buildings":
      updateItemTable("building")
      break;
    case "merger":
      updateMergerDescs()
      decideElementDisplay("moleculeMergerDesc", player.itemAmounts.upgrade[5].neq(0))
      break;
    case "upgrades":
      updateItemTable("upgrade")
      break;
    case "research":
      updateItemTable("research")
      updateItemTable("discover")
      updateDisposePercent()
      updateElement("researchStat", getResearchStat())
      decideElementDisplay("discoverRows", player.moleculeGained.gt(0))
      break;
    case "cranks":
      updateCrankSpeedBar()
      break;
    case "lore":
      updateLoreDisplay()
      break;
  }
}

function updateAllDisplay() {
  decideElementDisplay("tabBtnContainer", player.storyId>=4)
  updateHUD()
  updateTabBtnDisplay()
  updateTabContent(currentTab)
}

function getArrayTypeList() {
  let ret = {};
  Object.keys(player.itemAmountCaps).forEach(function(itemType) {
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

  // Research handle
  if (player.researchCurrentId != -1) {
    player.researchParticleSpent = player.researchParticleSpent.plus(particlePerSec()[1].times(diff).div(1000))
    if (player.researchParticleSpent.gte(player.itemCosts.research[player.researchCurrentId])) {
      player.researchParticleSpent = new Decimal(0)
      researchOnFinish[player.researchCurrentId]()
      player.itemAmounts.research[player.researchCurrentId] = player.itemAmounts.research[player.researchCurrentId].plus(1)
      player.researchCurrentId = -1
    }
  }

  // Molecule merger handle
  if (player.moleculeMergerOn) {
    player.moleculeMergerTime += diff/1000
    if (player.moleculeMergerTime >= 10) {
      player.moleculeMergerOn = false
      player.molecule = player.molecule.plus(1)
      player.moleculeGained = player.molecule.plus(1)
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
