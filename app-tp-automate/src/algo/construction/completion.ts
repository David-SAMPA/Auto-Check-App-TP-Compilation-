import { creerAutomate, tableDeterministe } from '../../model/automate'
import type { Automate } from '../../model/types'

export function completer(afd: Automate): { automate: Automate; puitsAjoute: boolean } {
  const table = tableDeterministe(afd)
  const manquantes = afd.etats.some((etat) => afd.alphabet.some((symbole) => !table.get(etat.id)?.has(symbole)))
  if (!manquantes) return { automate: afd, puitsAjoute: false }

  const idPuits = Math.max(-1, ...afd.etats.map((etat) => etat.id)) + 1
  const transitions = [...afd.transitions]
  for (const etat of afd.etats) {
    for (const symbole of afd.alphabet) {
      if (!table.get(etat.id)?.has(symbole)) transitions.push({ de: etat.id, symbole, vers: idPuits })
    }
  }
  for (const symbole of afd.alphabet) transitions.push({ de: idPuits, symbole, vers: idPuits })
  return {
    automate: creerAutomate(
      'AFD complet',
      afd.alphabet,
      [...afd.etats, { id: idPuits, nom: 'p', estPuits: true }],
      afd.initial,
      afd.finaux,
      transitions,
    ),
    puitsAjoute: true,
  }
}