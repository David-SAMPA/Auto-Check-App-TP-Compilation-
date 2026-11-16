import { nomEtat, tableDeterministe } from '../../model/automate'
import type { Automate, EtatId } from '../../model/types'

export interface Configuration {
  etat: EtatId
  reste: string
}

export function suivreConfigurations(afdComplet: Automate, mot: string): {
  configurations: Configuration[]
  accepte: boolean
} {
  const table = tableDeterministe(afdComplet)
  const configurations: Configuration[] = [{ etat: afdComplet.initial, reste: mot }]
  let etat = afdComplet.initial
  for (let index = 0; index < mot.length; index += 1) {
    const symbole = mot[index]
    if (symbole === undefined) continue
    const suivant = table.get(etat)?.get(symbole)
    if (suivant === undefined) throw new Error('Automate non complet')
    etat = suivant
    configurations.push({ etat, reste: mot.slice(index + 1) })
  }
  return { configurations, accepte: afdComplet.finaux.includes(etat) }
}

export function formaterConfigurations(
  configurations: Configuration[],
  auto: Automate,
  correspondance: Record<string, string> = {},
): string {
  return configurations.map(({ etat, reste }) =>
    `(${correspondance[nomEtat(auto, etat)] ?? nomEtat(auto, etat)}, ${reste.length > 0 ? reste : 'ε'})`,
  ).join(' ⊢ ')
}