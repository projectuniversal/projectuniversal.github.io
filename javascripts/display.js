isElement=function(a){try{return a.constructor.__proto__.prototype.constructor.name?!0:!1}catch(b){return!1}};
getElement=function(a){return isElement(a)?a:document.getElementById(a)}

function setOnclick(element,func) {
  getElement(element).onclick = func
}

function updateElement(element,text) {
  getElement(element).innerHTML = text
}

function decideElementDisplay(element,bool) {
  getElement(element).style.setProperty("display", bool?"":"none", "important")
}
