var researchStatText = ["Finding particles that can be merged together..."]
var researchOnFinish = [
  function() { player.molecule = player.molecule.plus(2); player.moleculeGained = player.moleculeGained.plus(2); }
]
function updateDisposePercent() {
  updateElement("researchSpendPercentDisplay", `Dumping ${player.researchSpendPercent}% of particles gained into research`)
}

canStartResearch = id => player.researchCurrentId != id && player.itemAmounts.research[id].neq(player.itemAmountCaps.research[id])

function startResearch(id) {
  if (!canStartResearch(id)) return
  player.researchCurrentId = id
  player.researchParticleSpent = new Decimal(0)
}

function getResearchEffectDisplay(id) {
  switch (id) {
    case 0:
      return "Creation of first molecule"
  }
}

function getDiscoverEffectDisplay(id) {
  switch (id) {
    case 0:
      return "Bigger scale production of molecules"
  }
}

function getResearchProgress() {
  return player.researchParticleSpent.div(player.itemCosts.research[player.researchCurrentId])
}

function getResearchStat() {
  if (player.researchCurrentId == -1) return "Doing nothing."
  return `${researchStatText[player.researchCurrentId]} ${formatPercent(getResearchProgress())} done`
}
