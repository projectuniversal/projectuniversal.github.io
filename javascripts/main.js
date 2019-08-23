function getDefaultPlayer() {
    return {
        lastUpdate: new Date().getTime(),
        inPrologue: true,
        atom: new Decimal(0),
        storyId: 0,
        queueTime: 0,
        queueInterval: 1,
        atomInQueue: new Decimal(0),
        queueCap: new Decimal(10),
        buildingAmounts: [new Decimal(0), new Decimal(0)],
        buildingCosts: [new Decimal(20), new Decimal(100)],
        buildingPowers: [new Decimal(0.2), new Decimal(1)],
        buildingCostScales: [new Decimal(1.1), new Decimal(1.2)],
        version: 2
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
                  "Soon enough, you realize..",
                  "you're taking part in the Universe's final moments.",
                  "And it all starts with this generator.",
                  "SYSTEM: The sum of all matter produced in the universe has surpassed the maximum threshold. Universal collapse in five seconds.",
                  "The Beginning",
                  "Buildings unlocked",
                  "Tier 1 unlocked (WIP)"]
let currentTab = "buildings"

setOnclick("storyNext", function() {
    player.storyId = Math.min(4,player.storyId+1)
})
/*setOnclick("activategen", function() {
    if (player.storyId < 4) return;
    getElement("activategen").innerHTML = "ACTIVATED"
    prologueGenActivated = true
})*/
setOnclick("atomClickGain",addAtomIntoQueue)

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
            onLoad()
            changeTab("buildings")
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
  player.inPrologue = false
  player.storyId = Math.min(6,player.storyId+1)
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
    let existingTabNames = ["buildings","upgrades","options"]
    existingTabNames.forEach(function(name) {
        let toDisplay = name==currentTab && player.storyId > 6
        decideElementDisplay(`${name}Tab`, toDisplay)
        if (toDisplay) getElement(`${name}TabBtn`).classList.add("active")
        else getElement(`${name}TabBtn`).classList.remove("active")
    })
}

function skipPrologue() {
  player.storyId = Math.max(6, player.storyId)
  player.inPrologue = false
}

function addAtomIntoQueue() {
  let addAmount = Decimal.min(player.queueCap.sub(player.atomInQueue),new Decimal(1))
  player.atomInQueue = player.atomInQueue.plus(addAmount)
}

function checkMilestone() {
  switch (player.storyId) {
    case 6:
      if (player.atom.gte(20)) player.storyId++
      updateTabDisplay()
      break;
    case 7:
      if (player.atom.gte(100)) player.storyId++
      break;
    default:
      return;
  }
}

function atomPerSec() {
  let ret = new Decimal(0)
  for (i=0;i<player.buildingAmounts.length;i++) {
    ret = ret.plus(player.buildingAmounts[i].times(player.buildingPowers[i]))
  }
  return ret
}

function getCurrentTier() {
    switch (player.storyId) {
        case 7:
            return 0;
        case 8:
            return 1;
        default:
            return -1;
    }
}

function buyBuilding(id) {
  if (getCurrentTier()<id) return;
  if (player.atom.gte(Decimal.ceil(player.buildingCosts[id]))) {
    player.buildingAmounts[id] = player.buildingAmounts[id].plus(1)
    player.atom = player.atom.sub(Decimal.ceil(player.buildingCosts[id]))
    player.buildingCosts[id] = player.buildingCosts[id].times(player.buildingCostScales[id])
  }
}

function getBuildingState(id) {
    if (getCurrentTier() < id) return "Locked"
    if (player.atom.lt(Decimal.ceil(player.buildingCosts[id]))) return "Can't afford"
    return "Buy"
}

function updateBuildings() {
    Array.from(getElement("buildingRows").rows).forEach((tr, id) => {
        tr.cells[1].innerHTML = `${shortenMoney(player.buildingPowers[id])} atom/s`
        tr.cells[2].innerHTML = `${shortenMoney(Decimal.ceil(player.buildingCosts[id]))} Atoms`
        let buyButton = tr.cells[3].childNodes[0]
        let buildingState = getBuildingState(id)
        buyButton.innerHTML = getBuildingState(id)
        switch (buildingState) {
            case "Locked":
                buyButton.classList.remove("btn-success","btn-danger")
                buyButton.classList.add("btn-secondary")
                break;
            case "Can't afford":
                buyButton.classList.remove("btn-success","btn-secondary")
                buyButton.classList.add("btn-danger")
                break;
            case "Buy":
                buyButton.classList.remove("btn-danger","btn-secondary")
                buyButton.classList.add("btn-success")
                break;
        }
    })
}

function resetValues(names) {
    let reference = getDefaultPlayer()
    names.forEach(function(name) {
        eval(`player.${name} = reference.${name}`) // Familiar?
    })
}

function refreshBuildings() {
    resetValues(["buildingCosts","buildingPowers","buildingCostScales"])
    for (let i=0;i<player.buildingCosts.length;i++) {
        if (typeof player.buildingAmounts[i] != "object") player.buildingAmounts[i] = new Decimal(0)
        else player.buildingCosts[i] = player.buildingCosts[i].times(Decimal.pow(player.buildingCostScales[i],player.buildingAmounts[i]))
    }
}

function gameLoop(diff) { // 1 diff = 0.001 seconds
  var thisUpdate = new Date().getTime()
  if (typeof diff === 'undefined') var diff = Math.min(thisUpdate - player.lastUpdate, 21600000);
  diff *= diffMultiplier

  if (player.storyId == 4 && prologueGenActivated) prologueAtom = prologueAtom.plus(new Decimal("1e78").times(diff/1000))
  if (player.storyId == 4 && prologueAtom.gte(new Decimal("1e80"))) {
    player.storyId = 5
    prologueAtom = new Decimal("1e80")
    setTimeout(endPrologue,5000)
  }
  if (player.storyId == 5) {
    prologueAtom = Decimal.pow10(prologueAtom.log10()-0.016*diff)
  }
  if (player.storyId>=7) {
      updateBuildings()
      player.atomInQueue = Decimal.min(player.queueCap, player.atomInQueue.plus(atomPerSec().times(diff).div(1000)))
  }
  if (!player.inPrologue) {
    player.queueTime += diff*0.001
    if (player.atomInQueue.lt(1)) {
      player.queueTime = 0
    } else if (player.queueTime>=player.queueInterval) {
      let atomToAdd = Decimal.floor(Decimal.min(player.atomInQueue, player.queueTime/player.queueInterval))
      player.queueTime -= player.queueInterval*atomToAdd
      player.atomInQueue = player.atomInQueue.sub(atomToAdd)
      player.atom = player.atom.plus(atomToAdd)
    }
    checkMilestone()
  }

  updateElement("timeTillNextAtom", shortenMoney(player.queueInterval-player.queueTime))
  updateElement("atomCount", `You have ${shortenMoney(player.inPrologue?prologueAtom:player.atom)} atoms`)
  updateElement("storyDisplay", storyTexts[player.storyId])
  updateElement("atomQueueAmount", shortenMoney(player.atomInQueue))
  updateElement("atomQueueCap", shortenMoney(player.queueCap))
  /*if (player.storyId == 4 || player.storyId == 5) $("#generator").fadeIn(3000)
  else decideElementDisplay("generator",player.storyId>5)
  decideElementDisplay("genContainer", player.inPrologue)*/
  decideElementDisplay("tabBtnContainer", player.storyId>=7)
  decideElementDisplay("storyNext", player.storyId<4)
  decideElementDisplay("atomClickGain", !player.inPrologue)
  decideElementDisplay("buildingsTabBtn", player.storyId>=7)
  decideElementDisplay("upgradesTabBtn", (player.storyId>=8)&&false)
  player.lastUpdate = thisUpdate
}
