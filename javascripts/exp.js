var expStatText = ["Testing the particle tester..."]

function updateDisposePercent() {
  updateElement("expSpendPercentDisplay", `Disposing ${player.expSpendPercent}% of particles gained into experiments`)
}

function startExp(id) {
  player.expCurrentId = id
  player.expParticleSpent = new Decimal(0)
}

function getExpEffectDisplay(id) {
  switch (id) {
    case 0:
      return "Nyan Cat's proudness"
  }
}

function getExpProgress() {
  return player.expParticleSpent.div(player.itemCosts.exp[player.expCurrentId])
}

function getExpStat() {
  if (player.expCurrentId == -1) return "Doing nothing."
  return `${expStatText[player.expCurrentId]} ${formatPercent(getExpProgress())} done`
}
