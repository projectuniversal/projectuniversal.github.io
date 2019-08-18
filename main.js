function getDefaultPlayer() {
    return {
        lastUpdate: new Date().getTime()
    }
}
getElement = document.getElementById.bind(document)

let gameLoopIntervalId = 0
let player = getDefaultPlayer()
let prologueAtom = new Decimal("9e79")
let prologueGenActivated = false
let storyId = 0
let storyTexts = ["Intro speak","Tells player to turn on gen","Explosion"]

getElement("storynext").onclick = function() {
    storyId = Math.min(1,storyId+1)
}

getElement("activategen").onclick = function() {
    if (storyId < 1) return;
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

function gameLoop(diff) { // 1 diff = 0.001 seconds
  var thisUpdate = new Date().getTime()
  if (typeof diff === 'undefined') var diff = Math.min(thisUpdate - player.lastUpdate, 21600000);
  if (prologueGenActivated) prologueAtom = prologueAtom.plus(new Decimal("1e78").times(diff/1000))
  if (prologueAtom.gte(new Decimal("1e80"))) storyId = 2
  getElement("atomcount").innerHTML = shortenMoney(prologueAtom)
  getElement("introstory").innerHTML = storyTexts[storyId]
  getElement("storynext").style.display = storyId<1?"":"none"
  player.lastUpdate = thisUpdate
}
