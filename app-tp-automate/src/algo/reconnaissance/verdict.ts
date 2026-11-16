import type { Automate, ErreurSaisie } from '../../model/types'
import { erreurMotHorsAlphabet } from '../../regex/erreurs'
import { reconnaitreAlgoSupport } from './algoSupport'
import { suivreConfigurations, type Configuration } from './configurations'
import { parcourirAutomate } from './parcoursAutomate'

export type NomMethode = 'Algorithme du cours' | 'Configurations' | 'Parcours de l\'automate'

export function verdict(afdComplet: Automate, mot: string): {
  accepte: boolean
  methodes: { nom: NomMethode; accepte: boolean }[]
  concordance: boolean
  configurations: Configuration[]
  chemin: ReturnType<typeof parcourirAutomate>
} | { erreur: ErreurSaisie } {
  if ([...mot].some((symbole) => !afdComplet.alphabet.includes(symbole))) return { erreur: erreurMotHorsAlphabet() }
  const support = reconnaitreAlgoSupport(afdComplet, mot)
  const configurations = suivreConfigurations(afdComplet, mot)
  const chemin = parcourirAutomate(afdComplet, mot)
  const methodes = [
    { nom: 'Algorithme du cours' as const, accepte: support.accepte },
    { nom: 'Configurations' as const, accepte: configurations.accepte },
    { nom: 'Parcours de l\'automate' as const, accepte: chemin.accepte },
  ]
  return {
    accepte: support.accepte,
    methodes,
    concordance: methodes.every((methode) => methode.accepte === support.accepte),
    configurations: configurations.configurations,
    chemin,
  }
}