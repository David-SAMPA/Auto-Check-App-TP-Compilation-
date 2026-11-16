import type { ErreurSaisie, Symbole } from '../model/types'

export const CODE_ERREUR = {
  ALPHABET_VIDE: 'ALPHABET_VIDE',
  SYMBOLE_LONG: 'SYMBOLE_LONG',
  SYMBOLE_DOUBLON: 'SYMBOLE_DOUBLON',
  SYMBOLE_RESERVE: 'SYMBOLE_RESERVE',
  EXPR_VIDE: 'EXPR_VIDE',
  CARACTERE_INCONNU: 'CARACTERE_INCONNU',
  PARENTHESE_NON_FERMEE: 'PARENTHESE_NON_FERMEE',
  PARENTHESE_NON_OUVERTE: 'PARENTHESE_NON_OUVERTE',
  PARENTHESES_VIDES: 'PARENTHESES_VIDES',
  OPERATEUR_SANS_OPERANDE: 'OPERATEUR_SANS_OPERANDE',
  UNION_SANS_OPERANDE: 'UNION_SANS_OPERANDE',
  MOT_HORS_ALPHABET: 'MOT_HORS_ALPHABET',
  SYNTAXE_INVALIDE: 'SYNTAXE_INVALIDE',
} as const

export const SYMBOLES_RESERVES = new Set(['|', '*', '+', '?', '(', ')', 'ε'])

export function erreurAlphabetVide(): ErreurSaisie {
  return { code: CODE_ERREUR.ALPHABET_VIDE, message: 'Saisissez au moins un symbole.' }
}

export function erreurSymboleLong(): ErreurSaisie {
  return { code: CODE_ERREUR.SYMBOLE_LONG, message: 'Chaque symbole doit être un seul caractère.' }
}

export function erreurSymboleDoublon(symbole: Symbole): ErreurSaisie {
  return { code: CODE_ERREUR.SYMBOLE_DOUBLON, message: `Le symbole « ${symbole} » apparaît deux fois.` }
}

export function erreurSymboleReserve(symbole: Symbole): ErreurSaisie {
  return {
    code: CODE_ERREUR.SYMBOLE_RESERVE,
    message: `Le symbole « ${symbole} » est réservé à la syntaxe des expressions.`,
  }
}

export function erreurExpressionVide(): ErreurSaisie {
  return { code: CODE_ERREUR.EXPR_VIDE, message: 'Saisissez une expression régulière.' }
}

export function erreurCaractereInconnu(symbole: Symbole, position: number): ErreurSaisie {
  return {
    code: CODE_ERREUR.CARACTERE_INCONNU,
    message: `Le caractère « ${symbole} » (position ${position}) n'appartient pas à l'alphabet.`,
    position,
  }
}

export function erreurParentheseNonFermee(position: number): ErreurSaisie {
  return {
    code: CODE_ERREUR.PARENTHESE_NON_FERMEE,
    message: `Parenthèse ouvrante sans parenthèse fermante (position ${position}).`,
    position,
  }
}

export function erreurParentheseNonOuverte(position: number): ErreurSaisie {
  return {
    code: CODE_ERREUR.PARENTHESE_NON_OUVERTE,
    message: `Parenthèse fermante sans parenthèse ouvrante (position ${position}).`,
    position,
  }
}

export function erreurParenthesesVides(position: number): ErreurSaisie {
  return { code: CODE_ERREUR.PARENTHESES_VIDES, message: `Parenthèses vides (position ${position}).`, position }
}

export function erreurOperateurSansOperande(symbole: string, position: number): ErreurSaisie {
  return {
    code: CODE_ERREUR.OPERATEUR_SANS_OPERANDE,
    message: `L'opérateur « ${symbole} » (position ${position}) n'a rien à répéter.`,
    position,
  }
}

export function erreurUnionSansOperande(position: number): ErreurSaisie {
  return {
    code: CODE_ERREUR.UNION_SANS_OPERANDE,
    message: `L'union « | » (position ${position}) a besoin d'une expression de chaque côté.`,
    position,
  }
}

export function erreurMotHorsAlphabet(): ErreurSaisie {
  return {
    code: CODE_ERREUR.MOT_HORS_ALPHABET,
    message: "Le mot contient un symbole qui n'est pas dans l'alphabet.",
  }
}

export function erreurSyntaxe(position: number): ErreurSaisie {
  return { code: CODE_ERREUR.SYNTAXE_INVALIDE, message: `Expression invalide (position ${position}).`, position }
}