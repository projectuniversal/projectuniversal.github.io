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
        buildingAmounts: [new Decimal(0)],
        buildingCosts: [new Decimal(20)],
        buildingPowers: [new Decimal(0.2)],
        buildingCostScales: [new Decimal(1.1)]
    }
}
getElement = document.getElementById.bind(document)

let gameLoopIntervalId = 0
let player = getDefaultPlayer()
let prologueAtom = new Decimal("9e79")
let prologueGenActivated = false
let storyTexts = ["Intro speak 1", "Intro speak 2", "Intro speak 3", "Intro speak 4", "Tells player to turn on gen","Explosion in 5 secs","The Beginning","Buildings unlocked"]

setOnclick("storynext", function() {
    player.storyId = Math.min(4,player.storyId+1)
})
setOnclick("activategen", function() {
    if (player.storyId < 4) return;
    getElement("activategen").innerHTML = "ACTIVATED"
    prologueGenActivated = true
})
setOnclick("atomClickGainBtn",addAtomIntoQueue)

function setOnclick(id,func) {
  getElement(id).onclick = func
}

function startInterval() {
  gameLoopIntervalId = setInterval(gameLoop, 10)
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

function skipPrologue() {
  player.storyId=6
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

function buyBuilding(id) {
  if (player.storyId<7) return;
  id--
  if (player.atom.gte(player.buildingCosts[id])) {
    player.buildingAmounts[id] = player.buildingAmounts[id].plus(1)
    player.atom = player.atom.sub(player.buildingCosts[id])
    player.buildingCosts[id] = player.buildingCosts[id].times(player.buildingCostScales[id])
  }
}

function updateBuildings() {
    Array.from(getElement("buildings-table").rows).forEach((tr, id) => {
        if (id>0) {
            tr.cells[1].innerHTML = `${shortenMoney(player.buildingPowers[id-1])} atom/s`
            tr.cells[2].innerHTML = `${shortenMoney(player.buildingCosts[id-1])} Atoms`
        }
    })
}

function gameLoop(diff) { // 1 diff = 0.001 seconds
  var thisUpdate = new Date().getTime()
  if (typeof diff === 'undefined') var diff = Math.min(thisUpdate - player.lastUpdate, 21600000);

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
  updateElement("atomcount", shortenMoney(player.inPrologue?prologueAtom:player.atom))
  updateElement("introstory", storyTexts[player.storyId])
  updateElement("atomQueueAmount", shortenMoney(player.atomInQueue))
  updateElement("atomQueueCap", shortenMoney(player.queueCap))
  decideElementDisplay("genContainer", player.inPrologue)
  decideElementDisplay("storynext", player.storyId<4)
  decideElementDisplay("atomClickGain", !player.inPrologue)
  decideElementDisplay("buildings-table", player.storyId>=7)
  player.lastUpdate = thisUpdate
}
