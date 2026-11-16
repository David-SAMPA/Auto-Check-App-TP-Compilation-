import type { Automate, ErreurSaisie, Noeud, Symbole } from '../model/types'
import { validerAlphabet, validerExpression } from '../regex/validateur'
import { versPostfixe } from '../regex/postfixe'
import { construireAfnEpsilon } from './construction/thompson'
import { determiniser, type EtapeDtran } from './construction/determinisation'
import { completer } from './construction/completion'
import { minimiser } from './construction/minimisation'

export type ResultatPipeline =
  | { ok: false; erreur: ErreurSaisie }
  | {
      ok: true
      alphabet: Symbole[]
      ast: Noeud
      postfixe: string
      afnEpsilon: Automate
      etapesDtran: EtapeDtran[]
      afd: Automate
      afdComplet: Automate
      puitsAjoute: boolean
      afdMinimal: Automate
      partitions: string[][][]
      correspondance: Record<string, string>
      resume: { etatsAfn: number; etatsAfd: number; etatsAfdComplet: number; etatsMinimal: number }
    }

export function construireTout(alphabetSaisie: string, expression: string): ResultatPipeline {
  const resultatAlphabet = validerAlphabet(alphabetSaisie)
  if (!resultatAlphabet.ok) return resultatAlphabet
  const resultatExpression = validerExpression(expression, resultatAlphabet.symboles)
  if (!resultatExpression.ok) return resultatExpression
  const ast = resultatExpression.ast
  const afnEpsilon = construireAfnEpsilon(ast, resultatAlphabet.symboles)
  const { afd, etapes } = determiniser(afnEpsilon)
  const { automate: afdComplet, puitsAjoute } = completer(afd)
  const { afdMinimal, partitions, correspondance } = minimiser(afdComplet)
  return {
    ok: true,
    alphabet: resultatAlphabet.symboles,
    ast,
    postfixe: versPostfixe(ast),
    afnEpsilon,
    etapesDtran: etapes,
    afd,
    afdComplet,
    puitsAjoute,
    afdMinimal,
    partitions,
    correspondance,
    resume: {
      etatsAfn: afnEpsilon.etats.length,
      etatsAfd: afd.etats.length,
      etatsAfdComplet: afdComplet.etats.length,
      etatsMinimal: afdMinimal.etats.length,
    },
  }
}