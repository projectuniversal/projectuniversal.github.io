var researchStatText = ["Finding particles that can be merged together...","Should have played more Factorio..."]
var researchOnFinish = [
  function() { player.molecule = player.molecule.plus(2); player.moleculeGained = player.moleculeGained.plus(2); },
  function() { updateResearchEffect(1); }
]
function updateDisposePercent() {
  updateElement("researchSpendPercentDisplay", `Dumping ${player.researchSpendPercent}% of particles gained into research`)
}

canStartResearch = id => player.researchCurrentId != id && player.itemAmounts.research[id].neq(player.itemAmountCaps.research[id])

function startResearch(id) {
  if (!canStartResearch(id)) return
  player.researchCurrentId = id
  player.researchParticleSpent = new Decimal(0)
  player.itemCosts.research[id] = player.itemCosts.research[id].times(player.itemCostScales.research[id])
}

function updateAllResearchEffect() {
    for (let i=0;i<player.itemAmounts.research.length;i++) {
        updateResearchEffect(i)
    }
}

function updateResearchEffect(id) {
  switch (id) {
    case 1:
      updateBuildingCostScales();
  }
}

function getResearchEffectDisplay(id) {
  switch (id) {
    case 0:
      return "Creation of first molecule"
    case 1:
      return "Cost scale decrease to buildings"
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
