import { calculerPositions, RAYON_ETAT } from '../../src/ui/dessin/layout'
import type { Automate } from '../../src/model/types'

describe('layout du graphe', () => {
  it('place chaque état sans chevauchement', () => {
    const automate: Automate = {
      type: 'AFD',
      alphabet: ['a', 'b'],
      etats: [{ id: 0, nom: 'A' }, { id: 1, nom: 'B' }, { id: 2, nom: 'C' }],
      initial: 0,
      finaux: [2],
      transitions: [
        { de: 0, symbole: 'a', vers: 1 }, { de: 0, symbole: 'b', vers: 2 },
        { de: 1, symbole: 'a', vers: 2 }, { de: 2, symbole: 'b', vers: 2 },
      ],
    }
    const positions = calculerPositions(automate)
    expect(positions.size).toBe(automate.etats.length)
    const points = [...positions.values()]
    for (let gauche = 0; gauche < points.length; gauche += 1) {
      for (let droite = gauche + 1; droite < points.length; droite += 1) {
        const premier = points[gauche]
        const second = points[droite]
        if (!premier || !second) continue
        expect(Math.hypot(premier.x - second.x, premier.y - second.y)).toBeGreaterThanOrEqual(RAYON_ETAT * 2)
      }
    }
  })
})