import type { Automate, EtatId, EtatInfo, Symbole, Transition, TypeAutomate } from './types'

export function creerAutomate(
  type: TypeAutomate,
  alphabet: Symbole[],
  etats: EtatInfo[],
  initial: EtatId,
  finaux: EtatId[],
  transitions: Transition[],
): Automate {
  return {
    type,
    alphabet: [...alphabet],
    etats: etats.map((etat) => ({ ...etat, ...(etat.contenu ? { contenu: [...etat.contenu] } : {}) })),
    initial,
    finaux: [...finaux],
    transitions: transitions.map((transition) => ({ ...transition })),
  }
}

export function nomEtat(auto: Automate, id: EtatId): string {
  const etat = auto.etats.find((element) => element.id === id)
  if (!etat) throw new Error(`État inconnu : ${id}`)
  return etat.nom
}

export function transitionsDepuis(auto: Automate, id: EtatId): Transition[] {
  return auto.transitions.filter((transition) => transition.de === id)
}

export function estFinal(auto: Automate, id: EtatId): boolean {
  return auto.finaux.includes(id)
}

export function tableDeterministe(auto: Automate): Map<EtatId, Map<Symbole, EtatId>> {
  const table = new Map<EtatId, Map<Symbole, EtatId>>()
  for (const etat of auto.etats) table.set(etat.id, new Map())
  for (const transition of auto.transitions) {
    const ligne = table.get(transition.de)
    if (!ligne) throw new Error(`État source inconnu : ${transition.de}`)
    if (ligne.has(transition.symbole)) throw new Error(`Transition déterministe en double : ${transition.symbole}`)
    ligne.set(transition.symbole, transition.vers)
  }
  return table
}

export function estComplet(auto: Automate): boolean {
  const table = tableDeterministe(auto)
  return auto.etats.every((etat) => auto.alphabet.every((symbole) => table.get(etat.id)?.has(symbole)))
}

export function etatsAccessibles(auto: Automate): Set<EtatId> {
  const accessibles = new Set<EtatId>([auto.initial])
  const file = [auto.initial]
  while (file.length > 0) {
    const courant = file.shift()
    if (courant === undefined) break
    for (const transition of transitionsDepuis(auto, courant)) {
      if (!accessibles.has(transition.vers)) {
        accessibles.add(transition.vers)
        file.push(transition.vers)
      }
    }
  }
  return accessibles
}