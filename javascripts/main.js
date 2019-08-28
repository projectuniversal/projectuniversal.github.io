function getDefaultPlayer() {
    return {
        lastUpdate: new Date().getTime(),
        atom: new Decimal(0),
        storyId: 0,
        mergeTime: 0,
        mergeInterval: 1,
        mergePower: new Decimal(1),
        particleAmount: new Decimal(0),
        particleCap: new Decimal(20),
        particleCreatePower: new Decimal(2),
        particleAtomRatio: new Decimal(3),
        itemAmounts: {
            building: [new Decimal(0), new Decimal(0)],
            upgrade: [new Decimal(0), new Decimal(0), new Decimal(0)]
        },
        itemCosts: {
            building: [new Decimal(20), new Decimal(100)],
            upgrade: [new Decimal(50), new Decimal(200), new Decimal(1)]
        },
        itemPowers: {
            building: [new Decimal(0.5), new Decimal(3)],
            upgrade: [new Decimal(2), new Decimal(10), new Decimal(0.5)]
        },
        itemCostScales: {
            building: [new Decimal(1.1), new Decimal(1.2)],
            upgrade: [new Decimal(2.5), new Decimal(250), new Decimal(2)]
        },
        itemAmountCaps: {
          building: [new Decimal(-1), new Decimal(-1)],
          upgrade: [new Decimal(-1), new Decimal(-1), new Decimal(4)]
        },
        placeholder: new Decimal(0),
        placeholderGained: new Decimal(0),
        placeholderNextReq: new Decimal(5e3),
        placeholderReqScale: new Decimal(2.5),
        version: 7
    }
}
getElement = document.getElementById.bind(document)

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
                  "The Beginning, next stage at 20 atoms",
                  "Building unlocked, next stage at 50 atoms",
                  "Upgrades unlocked, next stage at 100 atoms",
                  "Tier 1 unlocked, next stage at 5e3 atoms",
                  "Unnamed currency unlocked, end of content."]
let displayNames = {
    building: ["Particle constructor", "Place Holder"],
    upgrade: ["Bigger Atom Merger", "Bigger Particle Storage", "More efficient Atom merging"]
}
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

function setOnclick(id,func) {
  getElement(id).onclick = func
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

function hardReset() {
    if (confirm("Are you sure about reset ALL of your progress?")) {
        if (confirm("Do you REALLY sure? This is the LAST confirmation!")) {
            player = getDefaultPlayer()
            saveGame()
            location.reload()
        }
    }
}

function startGame() {
  let savefile = localStorage.getItem(saveName)
  if (!(savefile === null)) loadGame(savefile)
  startInterval()
  setInterval(saveGame,5000)
}

function endPrologue() {
  player.storyId = Math.min(6,player.storyId+1)
  changeTab("buildings")
}

function updateElement(id,text) {
  getElement(id).innerHTML = text
}

function decideElementDisplay(id,bool) {
  getElement(id).style.display = bool?"":"none"
}

function changeTab(tabName) {
    currentTab = tabName
    updateTabDisplay()
}

function updateTabDisplay() {
    let existingTabNames = ["generator","buildings","upgrades","options"]
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
  let addAmount = Decimal.min(player.particleCap.sub(player.particleAmount),player.particleCreatePower)
  player.particleAmount = player.particleAmount.plus(addAmount)
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
      if (player.atom.gte(5e3)) player.storyId++
    default:
      return;
  }
}

function particlePerSec() {
  let ret = new Decimal(0)
  for (i=0;i<player.itemAmounts.building.length;i++) {
    ret = ret.plus(player.itemAmounts.building[i].times(player.itemPowers.building[i]))
  }
  return ret
}

function getCurrentTier() {
    switch (player.storyId) {
        case 7:
        case 8:
            return 0;
        case 9:
        case 10:
            return 1;
        default:
            return -1;
    }
}

function updateAllUpgradeEffect() {
    for (let i=0;i<player.itemAmounts.upgrade.length;i++) {
        updateUpgradeEffect(i)
    }
}

function getUpgradeEffect(id) {
    switch (id) {
        case 0:
        case 1:
          return Decimal.pow(player.itemPowers.upgrade[id], player.itemAmounts.upgrade[id])
        case 2:
          return Decimal.min(player.itemPowers.upgrade[id].times(player.itemAmounts.upgrade[id]),2.5)
    }
}

function updateUpgradeEffect(id) {
    switch (id) {
        case 0:
          player.mergePower = getUpgradeEffect(0)
          break;
        case 1:
          resetValues(["particleCap"])
          player.particleCap = player.particleCap.times(getUpgradeEffect(1))
        case 2:
          resetValues(["particleAtomRatio"])
          player.particleAtomRatio = player.particleAtomRatio.sub(getUpgradeEffect(2))
    }
}

function canBuyItem(id, type) {
  switch (type) {
    case "building":
      return player.atom.gte(Decimal.ceil(player.itemCosts.building[id]))
    case "upgrade":
      return player[getUpgradeCostCurrencyName(id, type)].gte(Decimal.ceil(player.itemCosts.upgrade[id])) && player.itemAmounts.upgrade[id].neq(player.itemAmountCaps.upgrade[id])
    default:
      return false
  }
}

function buyItem(id, type) {
  if (type == "building" && getCurrentTier()<id) return;
  let currency = getUpgradeCostCurrencyName(id, type)
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

function updateBuildings() {
    Array.from(getElement("buildingRows").rows).forEach((tr, id) => {
        tr.cells[0].innerHTML = `${displayNames.building[id]}${player.itemAmounts.building[id].gt(0)?" (Owned "+shortenMoney(player.itemAmounts.building[id])+")":""}`
        tr.cells[1].innerHTML = `${shortenMoney(player.itemPowers.building[id])} particle/s`
        tr.cells[2].innerHTML = `${shortenMoney(Decimal.ceil(player.itemCosts.building[id]))} Atoms`
        let buyButton = tr.cells[3].childNodes[0]
        let buildingState = getBuildingState(id)
        buyButton.innerHTML = getBuildingState(id)
        buyButton.classList.toggle("btn-success", buildingState=="Buy")
        buyButton.classList.toggle("btn-danger", buildingState=="Can't afford")
        buyButton.classList.toggle("btn-secondary", buildingState=="Locked")
    })
}

function getUpgradeCostCurrencyName(id, type) {
  switch (type) {
    case "building":
      return "atom"
    case "upgrade":
      return id<2?"atom":"placeholder"
  }
}

function getUpgradeEffectDisplay(id) {
  switch (id) {
    case 0:
    case 1:
      return `${shortenMoney(getUpgradeEffect(id))}x`
      break;
    case 2:
      return `${new Decimal(3).sub(getUpgradeEffect(id))}:1`
  }
}

function updateUpgrades() {
    Array.from(getElement("upgradeRows").rows).forEach((tr, id) => {
        tr.cells[0].innerHTML = `${displayNames.upgrade[id]}${player.itemAmounts.upgrade[id].gt(0)?" (Owned "+shortenMoney(player.itemAmounts.upgrade[id])+")":""}`
        tr.cells[2].innerHTML = getUpgradeEffectDisplay(id)
        tr.cells[3].innerHTML = `${shortenMoney(Decimal.ceil(player.itemCosts.upgrade[id]))} ${getUpgradeCostCurrencyName(id, "upgrade")}s`
        let buyButton = tr.cells[4].childNodes[0]
        let availability = player.itemAmounts.upgrade[id].neq(player.itemAmountCaps.upgrade[id])?canBuyItem(id, "upgrade")?2:1:0
        let displayTexts = ["Maxed", "Can't afford", "Buy"]
        buyButton.innerHTML = displayTexts[availability]
        buyButton.classList.toggle("btn-success", availability==2)
        buyButton.classList.toggle("btn-danger", availability==1)
        buyButton.classList.toggle("btn-info", availability===0)
    })
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

function refreshPlaceholderReq() {
  resetValues(["placeholderNextReq", "placeholderReqScale"])
  player.placeholderNextReq = player.placeholderNextReq.times(Decimal.pow(player.placeholderReqScale, player.placeholderGained))
}

function checkPlaceholderGain() {
  let failsafe = 0
  while (failsafe < 100 && player.placeholderNextReq.lte(player.atom)) {
    player.placeholder = player.placeholder.plus(1)
    player.placeholderGained = player.placeholderGained.plus(1)
    player.placeholderNextReq = player.placeholderNextReq.times(player.placeholderReqScale)
    failsafe++
  }
}

function gameLoop(diff) { // 1 diff = 0.001 seconds
  // Diff handle
  var thisUpdate = new Date().getTime()
  if (typeof diff === 'undefined') var diff = Math.min(thisUpdate - player.lastUpdate, 21600000);
  diff *= diffMultiplier
  if (diffMultiplier > 1) console.log("SHAME")
  else if (diffMultiplier < 1) console.log("SLOWMOTION")

  // Prologue Atom handle
  if (player.storyId == 4 && prologueGenActivated) prologueAtom = prologueAtom.plus(new Decimal("1e78").times(diff/1000))
  if (player.storyId == 4 && prologueAtom.gte(new Decimal("1e80"))) {
    player.storyId = 5
    prologueAtom = new Decimal("1e80")
  }
  if (player.storyId == 5) {
    if (prologueAtom.lte(0.5)) endPrologue()
    prologueAtom = Decimal.pow10(prologueAtom.log10()-0.008*diff)
  }

  // Atom Merger handle
  if (player.storyId > 5) {
    updateBuildings()
    player.particleAmount = Decimal.min(player.particleCap, player.particleAmount.plus(particlePerSec().times(diff).div(1000)))
    player.mergeTime += diff*0.001
    if (player.particleAmount.lt(player.particleAtomRatio)) {
      player.mergeTime = 0
    } else if (player.mergeTime>=player.mergeInterval) {
      let atomToAdd = Decimal.floor(Decimal.min(player.particleAmount.div(player.particleAtomRatio), player.mergePower.times(player.mergeTime/player.mergeInterval)))
      player.mergeTime = Math.max(0, player.mergeTime-player.mergeInterval*atomToAdd)
      player.particleAmount = player.particleAmount.sub(atomToAdd.times(player.particleAtomRatio))
      player.atom = player.atom.plus(atomToAdd)
    }
    checkMilestone()
    checkPlaceholderGain()
  }

  // Update all display
  updateUpgrades()
  updateElement("timeTillNextAtom", shortenMoney(player.mergeInterval-player.mergeTime))
  updateElement("atomCount", `You have ${shortenMoney(player.storyId<=5?prologueAtom:player.atom)} Atoms`)
  updateElement("storyDisplay", storyTexts[player.storyId])
  updateElement("particleAmount", shortenMoney(player.particleAmount))
  updateElement("particleCap", shortenMoney(player.particleCap))
  updateElement("particleClickGain", `Create ${shortenMoney(player.particleCreatePower)} Particles`)
  updateElement("placeholderAmount", shortenMoney(player.placeholder))
  updateElement("placeholderNextReqDisplay", shortenMoney(player.placeholderNextReq))
  decideElementDisplay("tabBtnContainer", player.storyId>=4)
  decideElementDisplay("storyNext", player.storyId<4)
  decideElementDisplay("atomCountContainer", player.storyId>=6)
  decideElementDisplay("particleClickGainContainer", player.storyId>=6)
  decideElementDisplay("generatorTabBtn", player.storyId<6)
  decideElementDisplay("buildingsTabBtn", player.storyId>=6)
  decideElementDisplay("upgradesTabBtn", player.storyId>=8)
  decideElementDisplay("placeholderDisplayContainer", player.storyId>=10)
  decideElementDisplay("upg2Container", player.storyId>=10)
  player.lastUpdate = thisUpdate
}
