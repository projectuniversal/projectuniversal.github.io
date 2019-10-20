function startInterval() {
  gameLoopIntervalId = setInterval(gameLoop, 10)
}

function setupTables() {
  existingTableNames.forEach(function(name) {
    let table = getElement(`${name}Rows`)
    while (table.firstChild) { // No child jokes allowed here
      table.removeChild(table.firstChild);
    }
    let rows = player.itemAmountCaps[name].length // Picked amountCaps for no reason
    table.innerHTML = "<tr></tr>".repeat(rows)
    for (let i = 0; i<table.children.length; i++) {
      let row = table.children[i]
      row.innerHTML = '<td class="align-middle" style="height: 60px;"></td>'.repeat(tableCellAmounts[name])
      row.cells[row.cells.length - 1].innerHTML = `<button class="btn btn-success align-middle" type="button" onclick="${onclickCodeFunc[name](i)}"></button>`
    }
  })
}

function startGame() {
  setupTables()
  let savefile = localStorage.getItem(saveName)
  if (!(savefile === null)) loadGame(savefile)
  else onLoad()
  startInterval()
  setInterval(saveGame,5000)
}
