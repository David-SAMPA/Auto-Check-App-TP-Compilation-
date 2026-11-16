import { creerAutomate } from '../../model/automate'
import type { Automate, EtatId, Noeud, Symbole, Transition } from '../../model/types'

export function construireAfnEpsilon(ast: Noeud, alphabet: Symbole[]): Automate {
  let prochainId = 0
  const etats: { id: EtatId; nom: string }[] = []
  const transitions: Transition[] = []
  const nouvelEtat = (): EtatId => {
    const id = prochainId
    prochainId += 1
    etats.push({ id, nom: String(id) })
    return id
  }

  const construire = (noeud: Noeud, debutImpose?: EtatId): { i: EtatId; f: EtatId } => {
    switch (noeud.type) {
      case 'symbole':
      case 'epsilon': {
        const i = debutImpose ?? nouvelEtat()
        if (debutImpose !== undefined && !etats.some((etat) => etat.id === i)) {
          etats.push({ id: i, nom: String(i) })
        }
        const f = nouvelEtat()
        transitions.push({ de: i, symbole: noeud.type === 'epsilon' ? 'ε' : noeud.symbole, vers: f })
        return { i, f }
      }
      case 'union': {
        const i = debutImpose ?? nouvelEtat()
        const gauche = construire(noeud.gauche)
        const droite = construire(noeud.droite)
        const f = nouvelEtat()
        transitions.push(
          { de: i, symbole: 'ε', vers: gauche.i },
          { de: i, symbole: 'ε', vers: droite.i },
          { de: gauche.f, symbole: 'ε', vers: f },
          { de: droite.f, symbole: 'ε', vers: f },
        )
        return { i, f }
      }
      case 'concat': {
        const gauche = construire(noeud.gauche, debutImpose)
        const droite = construire(noeud.droite, gauche.f)
        return { i: gauche.i, f: droite.f }
      }
      case 'etoile': {
        const i = debutImpose ?? nouvelEtat()
        const enfant = construire(noeud.enfant)
        const f = nouvelEtat()
        transitions.push(
          { de: i, symbole: 'ε', vers: enfant.i },
          { de: enfant.f, symbole: 'ε', vers: f },
          { de: i, symbole: 'ε', vers: f },
          { de: enfant.f, symbole: 'ε', vers: enfant.i },
        )
        return { i, f }
      }
      case 'plus':
        return construire({
          type: 'concat',
          gauche: noeud.enfant,
          droite: { type: 'etoile', enfant: noeud.enfant },
        }, debutImpose)
      case 'option':
        return construire({ type: 'union', gauche: noeud.enfant, droite: { type: 'epsilon' } }, debutImpose)
    }
  }

  const { i, f } = construire(ast)
  return creerAutomate('AFN-ε', alphabet, etats, i, [f], transitions)
}