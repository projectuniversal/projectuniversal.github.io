var foo = { // I just can't name this one
  building: "Owned",
  upgrade: "Owned",
  research: "Did"
}

var displayNames = {
    building: ["Particle constructor", "T1 Building", "T2 Building"],
    upgrade: ["Bigger Atom Merger", "Bigger Particle Storage", "Research facility", "More efficient Atom merging", "The Cranks"],
    research: ["Make a molecule"]
}

var itemEffectDisplayFunc = {
  building: (id) => `${shortenMoney(player.itemPowers.building[id])} particle/s`,
  upgrade: getUpgradeEffectDisplay,
  research: getResearchEffectDisplay
}

var showItemFunc = {
  building: () => true,
  upgrade: showUpgrade,
  research: () => true
}

var itemCostCurrencyNameFunc = {
  building: () => "atom",
  upgrade: getUpgradeCostCurrencyName,
  research: () => "particle"
}

var itemAvailabilityFunc = {
  building: (id) => player.itemAmounts.building[id].neq(player.itemAmountCaps.building[id])?canBuyItem(id, "building")?2:1:0,
  upgrade: (id) => player.itemAmounts.upgrade[id].neq(player.itemAmountCaps.upgrade[id])?canBuyItem(id, "upgrade")?2:1:0,
  research: (id) => player.itemAmounts.research[id].neq(player.itemAmountCaps.research[id])?2:0
}

var itemDisplayTexts = {
  building: ["Maxed", "Can't afford", "Buy"],
  upgrade: ["Maxed", "Can't afford", "Buy"],
  research: ["Maxed", "", "Start"]
}

function updateItemTable(type) {
    Array.from(getElement(`${type}Rows`).rows).forEach((tr, id) => {
        let showThisItem = showItemFunc[type](id)
        decideElementDisplay(tr, showThisItem)
        if (showThisItem) {
          tr.cells[0].innerHTML = `${displayNames[type][id]} ${player.itemAmounts[type][id].gt(0)?`(${foo[type]} ${shortenMoney(player.itemAmounts[type][id])})`:""}`
          tr.cells[type == "building"?1:2].innerHTML = itemEffectDisplayFunc[type](id)
          tr.cells[type == "building"?2:3].innerHTML = `${shortenMoney(Decimal.ceil(player.itemCosts[type][id]))} ${itemCostCurrencyNameFunc[type](id)}s`
          let buyButton = tr.cells[type == "building"?3:4].childNodes[0]
          let availability = itemAvailabilityFunc[type](id)
          let displayTexts = itemDisplayTexts[type]
          buyButton.innerHTML = displayTexts[availability]
          buyButton.classList.toggle("btn-success", availability==2)
          buyButton.classList.toggle("btn-danger", availability==1)
          buyButton.classList.toggle("btn-info", availability===0)
        }
    })
}
