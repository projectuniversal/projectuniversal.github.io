var developmentTypes = ["c","c","c","c","c","e"]
var developmentTypeFullNames = {
  "c":"Construction",
  "e":"Expansion"
}

function updateAllDevelopmentEffect() {
    for (let i=0;i<player.itemAmounts.development.length;i++) {
        updateDevelopmentEffect(i)
    }
}

function getDevelopmentEffect(id) {
    switch (id) {
        case 0:
        case 1:
          return Decimal.pow(player.itemPowers.development[id], player.itemAmounts.development[id])
        case 3:
          return Decimal.min(player.itemPowers.development[id].times(player.itemAmounts.development[id]),2.5)
    }
}

function updateDevelopmentEffect(id) {
    switch (id) {
        case 0:
          player.mergePower = getDevelopmentEffect(0)
          break;
        case 1:
          resetValues(["particleCap"])
          player.particleCap = player.particleCap.times(getDevelopmentEffect(1))
        case 3:
          resetValues(["particleAtomRatio"])
          player.particleAtomRatio = player.particleAtomRatio.sub(getDevelopmentEffect(2))
    }
}

function getDevelopmentCostCurrencyName(id) {
  switch (id) {
    case 0:
    case 1:
    case 2:
    case 5:
      return "atom"
    case 3:
    case 4:
      return "molecule"
    default:
      return "bug"
  }
}

function getDevelopmentEffectDisplay(id) {
  switch (id) {
    case 0:
    case 1:
      return `${shortenMoney(getDevelopmentEffect(id))}x`
      break;
    case 2:
      return "Unlocks Research"
    case 3:
      return `${new Decimal(3).sub(getDevelopmentEffect(id))}:1`
    case 4:
      return "Unlocks the Cranks"
    case 5:
      return "Unlocks the molecule merger"
    default:
      return "Missing(BUG)"
  }
}

function showDevelopment(id) {
  if (player.itemAmounts.development[id].eq(player.itemAmountCaps.development[id]) && true) return false // Change true to bool when a toggle exists
  switch (id) {
    case 3:
      return player.moleculeGained.gt(1)
    case 4:
      return player.itemAmounts.development[3].neq(0)
    case 5:
      return player.itemAmounts.discover[0].neq(0)
    default:
      return true
  }
}
