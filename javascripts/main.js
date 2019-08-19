function getDefaultPlayer() {
    return {
        lastUpdate: new Date().getTime(),
        inPrologue: true,
        atom: new Decimal(0),
        storyId: 0,
        queueTime: 0,
        queueInterval: 1,
        atomInQueue: new Decimal(0),
        queueCap: new Decimal(10)
    }
}
getElement = document.getElementById.bind(document)

let gameLoopIntervalId = 0
let player = getDefaultPlayer()
let prologueAtom = new Decimal("9e79")
let prologueGenActivated = false
let storyTexts = ["Intro speak","Tells player to turn on gen","Explosion in 5 secs","The Beginning"]

setOnclick("storynext", function() {
    player.storyId = Math.min(1,player.storyId+1)
})
setOnclick("activategen", function() {
    if (player.storyId < 1) return;
    getElement("activategen").innerHTML = "ACTIVATED"
    prologueGenActivated = true
})
setOnclick("atomClickGainBtn",takeAtomFromQueue)

function setOnclick(id,func) {
  getElement(id).onclick = func
}

function startInterval() {
  gameLoopIntervalId = setInterval(gameLoop, 10)
}

function startGame() {
  startInterval()
  // There will be other thing here later
}

function endPrologue() {
  player.inPrologue = false
  player.storyId = Math.min(3,player.storyId+1)
}

function updateElement(id,text) {
  getElement(id).innerHTML = text
}

function decideElementDisplay(id,bool) {
  getElement(id).style.display = bool?"":"none"
}

function skipPrologue() {
  player.storyId=3
  player.inPrologue = false
}

function takeAtomFromQueue() {
  let takeAmount = new Decimal(1)
  if (player.atomInQueue.gte(1)) {
    let actualTakeAmount = Decimal.min(player.atomInQueue,takeAmount)
    player.atomInQueue = player.atomInQueue.minus(actualTakeAmount)
    player.atom = player.atom.plus(actualTakeAmount)
  }
}

function gameLoop(diff) { // 1 diff = 0.001 seconds
  var thisUpdate = new Date().getTime()
  if (typeof diff === 'undefined') var diff = Math.min(thisUpdate - player.lastUpdate, 21600000);
  if (player.inPrologue && prologueGenActivated) prologueAtom = prologueAtom.plus(new Decimal("1e78").times(diff/1000))
  if (player.storyId == 1 && prologueAtom.gte(new Decimal("1e80"))) {
    player.storyId = 2
    setTimeout(endPrologue,5000)
  }
  if (!player.inPrologue) {
    player.queueTime += diff*0.001
    if (player.queueTime>=player.queueInterval) {
      if (!player.atomInQueue.gte(player.queueCap)) {
        let atomToAdd = Math.min(player.queueCap.minus(player.atomInQueue), Math.floor(player.queueTime/player.queueInterval))
        player.queueTime -= player.queueInterval*atomToAdd
        player.atomInQueue = player.atomInQueue.plus(atomToAdd)
      } else {
        player.queueTime = player.queueInterval
      }
    }
  }
  updateElement("timeTillNextQueue", shortenMoney(player.queueInterval-player.queueTime))
  updateElement("atomcount", shortenMoney(player.inPrologue?prologueAtom:player.atom))
  updateElement("introstory", storyTexts[player.storyId])
  updateElement("atomQueueAmount", shortenMoney(player.atomInQueue))
  decideElementDisplay("genContainer", player.inPrologue)
  decideElementDisplay("storynext", player.storyId<1)
  decideElementDisplay("atomClickGain", !player.inPrologue)
  player.lastUpdate = thisUpdate
}
