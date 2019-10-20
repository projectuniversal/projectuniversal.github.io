var researchStatText = ["Finding particles that can be merged together..."]
var researchOnFinish = [
  function() { player.molecule = player.molecule.plus(1); player.moleculeGained = player.moleculeGained.plus(1); }
]
function updateDisposePercent() {
  updateElement("researchSpendPercentDisplay", `Dumping ${player.researchSpendPercent}% of particles gained into research`)
}

function startResearch(id) {
  player.researchCurrentId = id
  player.researchParticleSpent = new Decimal(0)
}

function getResearchEffectDisplay(id) {
  switch (id) {
    case 0:
      return "One molecule"
  }
}

function getResearchProgress() {
  return player.researchParticleSpent.div(player.itemCosts.research[player.researchCurrentId])
}

function getResearchStat() {
  if (player.researchCurrentId == -1) return "Doing nothing."
  return `${researchStatText[player.researchCurrentId]} ${formatPercent(getResearchProgress())} done`
}
