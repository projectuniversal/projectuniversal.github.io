getElement = document.getElementById.bind(document)

function setOnclick(id,func) {
  getElement(id).onclick = func
}

function updateElement(id,text) {
  getElement(id).innerHTML = text
}

function decideElementDisplay(id,bool) {
  getElement(id).style.display = bool?"":"none"
}
