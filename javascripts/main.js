function getDefaultPlayer() {
    return {
        lastUpdate: new Date().getTime(),
        inPrologue: true,
        atom: new Decimal(0),
        storyId: 0
    }
}
getElement = document.getElementById.bind(document)

let gameLoopIntervalId = 0
let player = getDefaultPlayer()
let prologueAtom = new Decimal("9e79")
let prologueGenActivated = false
let storyTexts = ["Intro speak","Tells player to turn on gen","Explosion in 5 secs","The Beginning"]

getElement("storynext").onclick = function() {
    player.storyId = Math.min(1,player.storyId+1)
}

getElement("activategen").onclick = function() {
    if (player.storyId < 1) return;
    getElement("activategen").innerHTML = "ACTIVATED"
    prologueGenActivated = true
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

function gameLoop(diff) { // 1 diff = 0.001 seconds
  var thisUpdate = new Date().getTime()
  if (typeof diff === 'undefined') var diff = Math.min(thisUpdate - player.lastUpdate, 21600000);
  if (player.inPrologue && prologueGenActivated) prologueAtom = prologueAtom.plus(new Decimal("1e78").times(diff/1000))
  if (player.storyId == 1 && prologueAtom.gte(new Decimal("1e80"))) {
    player.storyId = 2
    setTimeout(endPrologue,5000)
  }
  updateElement("atomcount", shortenMoney(player.inPrologue?prologueAtom:player.atom))
  updateElement("introstory", storyTexts[player.storyId])
  decideElementDisplay("genContainer", player.inPrologue)
  decideElementDisplay("storynext", player.storyId<1)
  player.lastUpdate = thisUpdate
}
