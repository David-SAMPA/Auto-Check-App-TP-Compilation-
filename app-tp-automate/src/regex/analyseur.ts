import type { Noeud, Symbole } from '../model/types'
import {
  erreurOperateurSansOperande,
  erreurParenthesesVides,
  erreurParentheseNonFermee,
  erreurParentheseNonOuverte,
  erreurSyntaxe,
  erreurUnionSansOperande,
} from './erreurs'
import { tokeniser, type Jeton } from './tokeniser'

class EchecAnalyse extends Error {
  readonly erreur: ReturnType<typeof erreurSyntaxe>

  constructor(erreur: ReturnType<typeof erreurSyntaxe>) {
    super(erreur.message)
    this.erreur = erreur
  }
}

class Analyseur {
  private index = 0
  private readonly jetons: Jeton[]
  private readonly alphabet: Symbole[]

  constructor(jetons: Jeton[], alphabet: Symbole[]) {
    this.jetons = jetons
    this.alphabet = alphabet
  }

  analyser(): Noeud {
    if (this.jetons.length === 0) throw new EchecAnalyse(erreurSyntaxe(1))
    const ast = this.expression()
    const reste = this.courant()
    if (reste) {
      if (reste.valeur === ')') throw new EchecAnalyse(erreurParentheseNonOuverte(reste.position))
      throw new EchecAnalyse(erreurSyntaxe(reste.position))
    }
    return ast
  }

  private expression(): Noeud {
    let gauche = this.terme()
    while (this.courant()?.valeur === '|') {
      const union = this.avancer()
      if (!this.estDebutFacteur(this.courant())) throw new EchecAnalyse(erreurUnionSansOperande(union.position))
      gauche = { type: 'union', gauche, droite: this.terme() }
    }
    return gauche
  }

  private terme(): Noeud {
    if (!this.estDebutFacteur(this.courant())) {
      const jeton = this.courant()
      if (jeton && ['*', '+', '?'].includes(jeton.valeur)) {
        throw new EchecAnalyse(erreurOperateurSansOperande(jeton.valeur, jeton.position))
      }
      if (jeton?.valeur === '|') throw new EchecAnalyse(erreurUnionSansOperande(jeton.position))
      if (jeton?.valeur === ')') throw new EchecAnalyse(erreurParentheseNonOuverte(jeton.position))
      throw new EchecAnalyse(erreurSyntaxe(jeton?.position ?? 1))
    }

    let noeud = this.facteur()
    while (this.estDebutFacteur(this.courant())) {
      noeud = { type: 'concat', gauche: noeud, droite: this.facteur() }
    }
    return noeud
  }

  private facteur(): Noeud {
    let noeud = this.base()
    while (['*', '+', '?'].includes(this.courant()?.valeur ?? '')) {
      const operateur = this.avancer()
      if (operateur.valeur === '*') noeud = { type: 'etoile', enfant: noeud }
      else if (operateur.valeur === '+') noeud = { type: 'plus', enfant: noeud }
      else noeud = { type: 'option', enfant: noeud }
    }
    return noeud
  }

  private base(): Noeud {
    const jeton = this.courant()
    if (!jeton) throw new EchecAnalyse(erreurSyntaxe(this.dernierePosition()))
    if (jeton.valeur === '(') {
      this.avancer()
      if (this.courant()?.valeur === ')') throw new EchecAnalyse(erreurParenthesesVides(jeton.position))
      const noeud = this.expression()
      if (this.courant()?.valeur !== ')') throw new EchecAnalyse(erreurParentheseNonFermee(jeton.position))
      this.avancer()
      return noeud
    }
    if (jeton.valeur === 'ε') {
      this.avancer()
      return { type: 'epsilon' }
    }
    if (this.alphabet.includes(jeton.valeur)) {
      this.avancer()
      return { type: 'symbole', symbole: jeton.valeur }
    }
    if (['*', '+', '?'].includes(jeton.valeur)) {
      throw new EchecAnalyse(erreurOperateurSansOperande(jeton.valeur, jeton.position))
    }
    if (jeton.valeur === ')') throw new EchecAnalyse(erreurParentheseNonOuverte(jeton.position))
    if (jeton.valeur === '|') throw new EchecAnalyse(erreurUnionSansOperande(jeton.position))
    throw new EchecAnalyse(erreurSyntaxe(jeton.position))
  }

  private estDebutFacteur(jeton: Jeton | undefined): boolean {
    return Boolean(jeton && (jeton.valeur === '(' || jeton.valeur === 'ε' || this.alphabet.includes(jeton.valeur)))
  }

  private courant(): Jeton | undefined {
    return this.jetons[this.index]
  }

  private avancer(): Jeton {
    const jeton = this.jetons[this.index]
    if (!jeton) throw new Error('Fin de l’expression inattendue')
    this.index += 1
    return jeton
  }

  private dernierePosition(): number {
    return (this.jetons.at(-1)?.position ?? 0) + 1
  }
}

export function analyserExpression(expression: string, alphabet: Symbole[]): Noeud {
  try {
    return new Analyseur(tokeniser(expression), alphabet).analyser()
  } catch (erreur: unknown) {
    if (erreur instanceof EchecAnalyse) throw erreur.erreur
    throw erreur
  }
}