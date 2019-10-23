function updateMergerDescs() {
  updateElement("atomMergerDesc", `Atom Merger: ${player.particleAtomRatio} Particles -> 1 Atom, ${shorten(player.mergePower)} bulks max, 1s interval`)
}

function moleculeMergerActivate() {
  if (player.atom.lt(player.atomMoleculeRatio) || player.moleculeMergerOn) return false
  player.moleculeMergerOn = true
  player.moleculeMergerTime = 0
  return true
}
