export type Symbole = string
export const EPSILON = 'ε'
export type EtatId = number

export interface Transition {
  de: EtatId
  symbole: Symbole
  vers: EtatId
}

export interface EtatInfo {
  id: EtatId
  nom: string
  contenu?: string[]
  estPuits?: boolean
}

export type TypeAutomate = 'AFN-ε' | 'AFD' | 'AFD complet' | 'AFD minimal'

export interface Automate {
  type: TypeAutomate
  alphabet: Symbole[]
  etats: EtatInfo[]
  initial: EtatId
  finaux: EtatId[]
  transitions: Transition[]
}

export type Noeud =
  | { type: 'epsilon' }
  | { type: 'symbole'; symbole: Symbole }
  | { type: 'union'; gauche: Noeud; droite: Noeud }
  | { type: 'concat'; gauche: Noeud; droite: Noeud }
  | { type: 'etoile'; enfant: Noeud }
  | { type: 'plus'; enfant: Noeud }
  | { type: 'option'; enfant: Noeud }

export interface ErreurSaisie {
  code: string
  message: string
  position?: number
}