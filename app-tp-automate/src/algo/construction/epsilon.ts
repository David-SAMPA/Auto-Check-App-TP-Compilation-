import type { Automate, EtatId, Symbole } from '../../model/types'

export function fermetureEpsilon(auto: Automate, ensemble: Set<EtatId>): Set<EtatId> {
  const resultat = new Set(ensemble)
  const pile = [...ensemble]
  while (pile.length > 0) {
    const courant = pile.pop()
    if (courant === undefined) continue
    for (const transition of auto.transitions) {
      if (transition.de === courant && transition.symbole === 'ε' && !resultat.has(transition.vers)) {
        resultat.add(transition.vers)
        pile.push(transition.vers)
      }
    }
  }
  return resultat
}

export function transiter(auto: Automate, ensemble: Set<EtatId>, symbole: Symbole): Set<EtatId> {
  const resultat = new Set<EtatId>()
  for (const transition of auto.transitions) {
    if (transition.symbole === symbole && ensemble.has(transition.de)) resultat.add(transition.vers)
  }
  return resultat
}