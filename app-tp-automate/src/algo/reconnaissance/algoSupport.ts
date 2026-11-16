import { tableDeterministe } from '../../model/automate'
import type { Automate, EtatId } from '../../model/types'

export function reconnaitreAlgoSupport(afdComplet: Automate, mot: string): { accepte: boolean; etatFinal: EtatId } {
  const table = tableDeterministe(afdComplet)
  let etat = afdComplet.initial
  for (const symbole of mot) {
    const suivant = table.get(etat)?.get(symbole)
    if (suivant === undefined) throw new Error('Automate non complet')
    etat = suivant
  }
  return { accepte: afdComplet.finaux.includes(etat), etatFinal: etat }
}