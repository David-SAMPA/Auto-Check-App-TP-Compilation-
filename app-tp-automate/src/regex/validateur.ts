import type { ErreurSaisie, Noeud, Symbole } from '../model/types'
import {
  erreurAlphabetVide,
  erreurCaractereInconnu,
  erreurExpressionVide,
  erreurSymboleDoublon,
  erreurSymboleLong,
  erreurSymboleReserve,
  SYMBOLES_RESERVES,
} from './erreurs'
import { analyserExpression } from './analyseur'
import { tokeniser } from './tokeniser'

export type ResultatAlphabet = { ok: true; symboles: Symbole[] } | { ok: false; erreur: ErreurSaisie }
export type ResultatExpression = { ok: true; ast: Noeud } | { ok: false; erreur: ErreurSaisie }

export function validerAlphabet(saisie: string): ResultatAlphabet {
  const symboles = saisie.split(/[\s,]+/u).filter((symbole) => symbole.length > 0)
  if (symboles.length === 0) return { ok: false, erreur: erreurAlphabetVide() }
  const vus = new Set<string>()
  for (const symbole of symboles) {
    if ([...symbole].length !== 1) return { ok: false, erreur: erreurSymboleLong() }
    if (vus.has(symbole)) return { ok: false, erreur: erreurSymboleDoublon(symbole) }
    if (SYMBOLES_RESERVES.has(symbole)) return { ok: false, erreur: erreurSymboleReserve(symbole) }
    vus.add(symbole)
  }
  return { ok: true, symboles }
}

export function validerExpression(expression: string, alphabet: Symbole[]): ResultatExpression {
  if (tokeniser(expression).length === 0) return { ok: false, erreur: erreurExpressionVide() }
  for (const jeton of tokeniser(expression)) {
    if (!SYMBOLES_RESERVES.has(jeton.valeur) && !alphabet.includes(jeton.valeur)) {
      return { ok: false, erreur: erreurCaractereInconnu(jeton.valeur, jeton.position) }
    }
  }
  try {
    return { ok: true, ast: analyserExpression(expression, alphabet) }
  } catch (erreur: unknown) {
    if (typeof erreur === 'object' && erreur !== null && 'code' in erreur && 'message' in erreur) {
      return { ok: false, erreur: erreur as ErreurSaisie }
    }
    throw erreur
  }
}