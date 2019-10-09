var foo = { // I just can't name this one
  building: "Owned",
  upgrade: "Owned",
  exp: "Did"
}

var displayNames = {
    building: ["Particle constructor", "T1 Building", "T2 Building"],
    upgrade: ["Bigger Atom Merger", "Bigger Particle Storage", "Experiment facility", "More efficient Atom merging", "The Cranks"],
    exp: ["Dummy Experiment"]
}

function showItem(type,id) {
  switch (type) {
    case "building":
      return true
    case "upgrade":
      return showUpgrade(id)
    case "exp":
      return true
  }
}

function getItemEffectDisplay(type, id) {
  switch (type) {
    case "building":
      return `${shortenMoney(player.itemPowers.building[id])} particle/s`
    case "upgrade":
      return getUpgradeEffectDisplay(id)
    case "exp":
      return getExpEffectDisplay(id)
  }
}

function getItemCostCurrencyName(type, id) {
  switch (type) {
    case "building":
      return "atom"
    case "upgrade":
      switch (id) {
        case 0:
        case 1:
        case 2:
          return "atom"
        case 3:
        case 4:
          return "molecule"
        default:
          return "bug"
      }
    case "exp":
      return "particle"
  }
}

function getItemAvailability(type, id) {
  switch (type) {
    case "building":
    case "upgrade":
      return player.itemAmounts[type][id].neq(player.itemAmountCaps[type][id])?canBuyItem(id, type)?2:1:0
    case "exp":
      return player.itemAmounts[type][id].neq(player.itemAmountCaps[type][id])?2:0
  }
}

var itemDisplayTexts = {
  building: ["Maxed", "Can't afford", "Buy"],
  upgrade: ["Maxed", "Can't afford", "Buy"],
  exp: ["Maxed", "", "Start"]
}

function updateItemTable(type) {
    Array.from(getElement(`${type}Rows`).rows).forEach((tr, id) => {
        let showThisItem = showItem(type,id)
        decideElementDisplay(tr, showThisItem)
        if (showThisItem) {
          tr.cells[0].innerHTML = `${displayNames[type][id]} ${player.itemAmounts[type][id].gt(0)?`(${foo[type]} ${shortenMoney(player.itemAmounts.upgrade[id])})`:""}`
          tr.cells[type == "building"?1:2].innerHTML = getItemEffectDisplay(type, id)
          tr.cells[type == "building"?2:3].innerHTML = `${shortenMoney(Decimal.ceil(player.itemCosts[type][id]))} ${getItemCostCurrencyName(type, id)}s`
          let buyButton = tr.cells[type == "building"?3:4].childNodes[0]
          let availability = getItemAvailability(type, id)
          let displayTexts = itemDisplayTexts[type]
          buyButton.innerHTML = displayTexts[availability]
          buyButton.classList.toggle("btn-success", availability==2)
          buyButton.classList.toggle("btn-danger", availability==1)
          buyButton.classList.toggle("btn-info", availability===0)
        }
    })
}
