import { creerAutomate } from '../../model/automate'
import type { Automate, EtatId, Symbole } from '../../model/types'
import { fermetureEpsilon, transiter } from './epsilon'

export interface EtapeDtran {
  nom: string
  contenu: number[]
  transitions: Record<Symbole, string | null>
}

function cleEnsemble(ensemble: Set<EtatId>): string {
  return [...ensemble].sort((a, b) => a - b).join(',')
}

function nomDeterministe(index: number): string {
  return `${String.fromCharCode(65 + (index % 26))}${index >= 26 ? Math.floor(index / 26) : ''}`
}

export function determiniser(afn: Automate): { afd: Automate; etapes: EtapeDtran[] } {
  const initial = fermetureEpsilon(afn, new Set([afn.initial]))
  const ensembles: Set<EtatId>[] = [initial]
  const noms = new Map<string, string>([[cleEnsemble(initial), nomDeterministe(0)]])
  const transitions: Automate['transitions'] = []
  const etapes: EtapeDtran[] = []

  for (let index = 0; index < ensembles.length; index += 1) {
    const ensemble = ensembles[index]
    if (!ensemble) continue
    const contenu = [...ensemble].sort((a, b) => a - b)
    const nom = noms.get(cleEnsemble(ensemble))
    if (!nom) throw new Error('Nom d’état déterministe manquant')
    const resultatLigne: Record<Symbole, string | null> = {}
    for (const symbole of afn.alphabet) {
      const cible = fermetureEpsilon(afn, transiter(afn, ensemble, symbole))
      const cle = cleEnsemble(cible)
      if (cible.size === 0) {
        resultatLigne[symbole] = null
        continue
      }
      let nomCible = noms.get(cle)
      if (!nomCible) {
        nomCible = nomDeterministe(ensembles.length)
        noms.set(cle, nomCible)
        ensembles.push(cible)
      }
      resultatLigne[symbole] = nomCible
      const indexCible = [...noms.values()].indexOf(nomCible)
      transitions.push({ de: index, symbole, vers: indexCible })
    }
    etapes.push({ nom, contenu, transitions: resultatLigne })
  }

  const etats = etapes.map((etape, id) => ({
    id,
    nom: etape.nom,
    contenu: etape.contenu.map(String),
  }))
  const finaux = etapes.flatMap((etape, id) =>
    etape.contenu.some((etat) => afn.finaux.includes(etat)) ? [id] : [],
  )
  return {
    afd: creerAutomate('AFD', afn.alphabet, etats, 0, finaux, transitions),
    etapes,
  }
}