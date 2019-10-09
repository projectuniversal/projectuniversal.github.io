function updateAllUpgradeEffect() {
    for (let i=0;i<player.itemAmounts.upgrade.length;i++) {
        updateUpgradeEffect(i)
    }
}

function getUpgradeEffect(id) {
    switch (id) {
        case 0:
        case 1:
          return Decimal.pow(player.itemPowers.upgrade[id], player.itemAmounts.upgrade[id])
        case 3:
          return Decimal.min(player.itemPowers.upgrade[id].times(player.itemAmounts.upgrade[id]),2.5)
    }
}

function updateUpgradeEffect(id) {
    switch (id) {
        case 0:
          player.mergePower = getUpgradeEffect(0)
          break;
        case 1:
          resetValues(["particleCap"])
          player.particleCap = player.particleCap.times(getUpgradeEffect(1))
        case 3:
          resetValues(["particleAtomRatio"])
          player.particleAtomRatio = player.particleAtomRatio.sub(getUpgradeEffect(2))
    }
}

function getUpgradeCostCurrencyName(id, type) {
  if (type == "building") return "atom"
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
}

function getUpgradeEffectDisplay(id) {
  switch (id) {
    case 0:
    case 1:
      return `${shortenMoney(getUpgradeEffect(id))}x`
      break;
    case 2:
      return "Unlocks experiments"
    case 3:
      return `${new Decimal(3).sub(getUpgradeEffect(id))}:1`
    case 4:
      return "Unlocks the Cranks"
    default:
      return "Missing(BUG)"
  }
}

function showUpgrade(id) {
  if (player.itemAmounts.upgrade[id].eq(player.itemAmountCaps.upgrade[id]) && true) return false // Change true to bool when a toggle exists
  switch (id) {
    case 3:
      return player.storyId>=10
    case 4:
      return player.storyId>=11
    default:
      return true
  }
}

function updateUpgrades() {
    Array.from(getElement("upgradeRows").rows).forEach((tr, id) => {
        let showThisUpgrade = showUpgrade(id)
        decideElementDisplay(tr, showThisUpgrade)
        if (showThisUpgrade) {
          tr.cells[0].innerHTML = `${displayNames.upgrade[id]}${player.itemAmounts.upgrade[id].gt(0)?" (Owned "+shortenMoney(player.itemAmounts.upgrade[id])+")":""}`
          tr.cells[2].innerHTML = getUpgradeEffectDisplay(id)
          tr.cells[3].innerHTML = `${shortenMoney(Decimal.ceil(player.itemCosts.upgrade[id]))} ${getUpgradeCostCurrencyName(id, "upgrade")}s`
          let buyButton = tr.cells[4].childNodes[0]
          let availability = player.itemAmounts.upgrade[id].neq(player.itemAmountCaps.upgrade[id])?canBuyItem(id, "upgrade")?2:1:0
          let displayTexts = ["Maxed", "Can't afford", "Buy"]
          buyButton.innerHTML = displayTexts[availability]
          buyButton.classList.toggle("btn-success", availability==2)
          buyButton.classList.toggle("btn-danger", availability==1)
          buyButton.classList.toggle("btn-info", availability===0)
        }
    })
}
