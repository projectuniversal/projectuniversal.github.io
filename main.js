function getDefaultPlayer() {
    return {
        // yep, nothing
    }
}
getElement = document.getElementById.bind(document) // will work...?

let player = getDefaultPlayer()
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
