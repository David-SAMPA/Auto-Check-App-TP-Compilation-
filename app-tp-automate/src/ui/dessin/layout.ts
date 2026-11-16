import type { Automate, EtatId } from '../../model/types'

export interface Position {
  x: number
  y: number
}

export const RAYON_ETAT = 22

export function calculerPositions(auto: Automate): Map<EtatId, Position> {
  const profondeurs = new Map<EtatId, number>([[auto.initial, 0]])
  const file = [auto.initial]
  while (file.length > 0) {
    const courant = file.shift()
    if (courant === undefined) continue
    const profondeur = profondeurs.get(courant) ?? 0
    for (const transition of auto.transitions) {
      if (transition.de !== courant || profondeurs.has(transition.vers)) continue
      profondeurs.set(transition.vers, profondeur + 1)
      file.push(transition.vers)
    }
  }
  const profondeurMax = Math.max(0, ...profondeurs.values())
  for (const etat of auto.etats) {
    if (!profondeurs.has(etat.id)) profondeurs.set(etat.id, profondeurMax + 1)
  }
  const couches = new Map<number, EtatId[]>()
  for (const etat of auto.etats) {
    const profondeur = profondeurs.get(etat.id) ?? 0
    const couche = couches.get(profondeur) ?? []
    couche.push(etat.id)
    couches.set(profondeur, couche)
  }
  const positions = new Map<EtatId, Position>()
  for (const [profondeur, ids] of couches) {
    ids.forEach((id, index) => positions.set(id, { x: 70 + profondeur * 130, y: 70 + index * 100 }))
  }
  return positions
}