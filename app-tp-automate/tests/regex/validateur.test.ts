import { CODE_ERREUR } from '../../src/regex/erreurs'
import { validerAlphabet, validerExpression } from '../../src/regex/validateur'
import { versPostfixe } from '../../src/regex/postfixe'

describe('validation de l’alphabet', () => {
  it('accepte les symboles séparés par des virgules ou des espaces', () => {
    expect(validerAlphabet('a, b c')).toEqual({ ok: true, symboles: ['a', 'b', 'c'] })
  })

  it.each([
    ['', CODE_ERREUR.ALPHABET_VIDE],
    ['ab', CODE_ERREUR.SYMBOLE_LONG],
    ['a, a', CODE_ERREUR.SYMBOLE_DOUBLON],
    ['*', CODE_ERREUR.SYMBOLE_RESERVE],
  ])('signale l’alphabet invalide %s', (saisie, code) => {
    expect(validerAlphabet(saisie)).toMatchObject({ ok: false, erreur: { code } })
  })
})

describe('validation et postfixe', () => {
  it.each(['(a|b)*abb', 'a*b', '(ab)*', 'a+b?', 'a**', 'ε', '(a|b)+'])('accepte %s', (expression) => {
    expect(validerExpression(expression, ['a', 'b']).ok).toBe(true)
  })

  it('respecte le postfixe du support', () => {
    const resultat = validerExpression('(a|b)*abb', ['a', 'b'])
    expect(resultat.ok).toBe(true)
    if (resultat.ok) expect(versPostfixe(resultat.ast)).toBe('ab|*a.b.b.')
  })

  it.each([
    ['(a|b', CODE_ERREUR.PARENTHESE_NON_FERMEE, 1],
    ['|a', CODE_ERREUR.UNION_SANS_OPERANDE, 1],
    ['a|', CODE_ERREUR.UNION_SANS_OPERANDE, 2],
    ['*a', CODE_ERREUR.OPERATEUR_SANS_OPERANDE, 1],
    ['()', CODE_ERREUR.PARENTHESES_VIDES, 1],
    ['a)', CODE_ERREUR.PARENTHESE_NON_OUVERTE, 2],
    ['abc', CODE_ERREUR.CARACTERE_INCONNU, 3],
    ['', CODE_ERREUR.EXPR_VIDE, undefined],
  ])('signale la première erreur de %s', (expression, code, position) => {
    expect(validerExpression(expression, ['a', 'b'])).toMatchObject({
      ok: false,
      erreur: position === undefined ? { code } : { code, position },
    })
  })
})