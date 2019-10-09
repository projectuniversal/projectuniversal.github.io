function updateDisposePercent() {
  updateElement("expSpendPercentDisplay", `Disposing ${player.expSpendPercent}% of particles gained into experiments`)
}

function getExpEffectDisplay(id) {
  switch (id) {
    case 0:
      return "Nyan Cat's proudness"
  }
}
