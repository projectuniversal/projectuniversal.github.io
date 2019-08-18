function getDefaultPlayer() {
    return {
        lastUpdate: new Date().getTime()
    }
}
getElement = document.getElementById.bind(document)

let gameLoopIntervalId = 0
let player = getDefaultPlayer()
let prologueAtom = new Decimal(9e89)
let storyId = 0
let storyTexts = ["story text","story text 2","story text 3","this should not display"]
getElement("storynext").onclick = function() {
    switch (storyId) {
        case 0:
        case 1:
          storyId++
          break;
        default:
          return;
    }
    getElement("introstory").innerHTML = storyTexts[storyId]
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
  // getElement("atomcount").innerHTML = shortenMoney(prologueAtom)
  player.lastUpdate = thisUpdate
}
