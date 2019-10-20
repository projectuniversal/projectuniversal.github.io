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

function getUpgradeCostCurrencyName(id) {
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
      return "Unlocks Research"
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
      return player.moleculeGained.gt(0)
    case 4:
      return player.itemAmounts.upgrade[3].neq(0)
    default:
      return true
  }
}
