import { validerAlphabet, validerExpression } from '../../regex/validateur'
import type { ErreurSaisie } from '../../model/types'
import { creerMessage } from '../composants/message'
import { element } from '../utils/dom'

export interface EntreeLangage {
  alphabet: string
  expression: string
  changer: (alphabet: string, expression: string) => void
  validite: (valide: boolean) => void
  construire: () => void
}

function apercuExpression(expression: string, position?: number): HTMLElement {
  const apercu = element('p', { classe: 'apercu-expression', attributs: { 'aria-label': 'Aperçu de l’expression' } })
  for (let index = 0; index < expression.length; index += 1) {
    const caractere = expression[index] ?? ''
    if (position === index + 1) apercu.append(element('span', { classe: 'caractere-fautif', texte: caractere }))
    else apercu.append(document.createTextNode(caractere))
  }
  return apercu
}

function afficherErreur(zone: HTMLElement, expression: string, erreur?: ErreurSaisie): void {
  zone.replaceChildren()
  if (!erreur) return
  zone.append(creerMessage('erreur', erreur.message))
  if (erreur.position !== undefined) zone.append(apercuExpression(expression, erreur.position))
}

function creerChamp(
  id: string,
  libelle: string,
  valeur: string,
  placeholder: string,
): { champ: HTMLElement; saisie: HTMLInputElement; erreur: HTMLElement } {
  const champ = element('div', { classe: 'champ' })
  const saisie = element('input', {
    classe: 'champ-texte champ-mono',
    attributs: {
      id: `champ-${id}`, type: 'text', value: valeur, placeholder,
      autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
      'aria-describedby': `erreur-${id}`,
    },
  })
  const erreur = element('div', { classe: 'zone-validation', attributs: { id: `erreur-${id}` } })
  champ.append(element('label', { texte: libelle, attributs: { for: `champ-${id}` } }), saisie, erreur)
  return { champ, saisie, erreur }
}

export function creerEcranLangage(entree: EntreeLangage): HTMLElement {
  const ecran = element('section', { classe: 'ecran ecran-langage', attributs: { 'aria-labelledby': 'titre-langage' } })
  const introduction = element('header', { classe: 'entete-ecran' })
  introduction.append(
    element('p', { classe: 'surtitre', texte: 'ÉTAPE 1 SUR 3' }),
    element('h1', { texte: 'Quel langage voulez-vous reconnaître ?', attributs: { id: 'titre-langage' } }),
  )

  const formulaire = element('form', { classe: 'formulaire-langage', attributs: { id: 'form-langage', novalidate: 'true' } })
  const { champ: champAlphabet, saisie: alphabet, erreur: erreurAlphabet } =
    creerChamp('alphabet', 'Alphabet', entree.alphabet, 'a, b')
  const { champ: champExpression, saisie: expression, erreur: erreurExpression } =
    creerChamp('expression', 'Expression régulière', entree.expression, '(a|b)*abb')

  const valider = (): boolean => {
    const alphabetValide = validerAlphabet(alphabet.value)
    alphabet.setAttribute('aria-invalid', String(!alphabetValide.ok))
    if (!alphabetValide.ok) {
      erreurAlphabet.replaceChildren(creerMessage('erreur', alphabetValide.erreur.message))
      expression.setAttribute('aria-invalid', 'false')
      erreurExpression.replaceChildren()
      entree.validite(false)
      return false
    }
    erreurAlphabet.replaceChildren()
    const expressionValide = validerExpression(expression.value, alphabetValide.symboles)
    expression.setAttribute('aria-invalid', String(!expressionValide.ok))
    if (!expressionValide.ok) {
      afficherErreur(erreurExpression, expression.value, expressionValide.erreur)
      entree.validite(false)
      return false
    }
    afficherErreur(erreurExpression, expression.value)
    entree.validite(true)
    return true
  }

  let temporisateurValidation: number | undefined
  const actualiser = (): void => {
    entree.changer(alphabet.value, expression.value)
    window.clearTimeout(temporisateurValidation)
    temporisateurValidation = window.setTimeout(() => valider(), 160)
  }
  alphabet.addEventListener('input', actualiser)
  expression.addEventListener('input', actualiser)
  formulaire.addEventListener('submit', (event) => {
    event.preventDefault()
    if (valider()) entree.construire()
  })
  // Permet de valider avec la touche Entrée depuis l'un des deux champs.
  const soumissionClavier = element('button', {
    classe: 'soumission-invisible', texte: 'Construire l’automate',
    attributs: { type: 'submit', 'aria-hidden': 'true', tabindex: '-1' },
  })
  formulaire.append(champAlphabet, champExpression, soumissionClavier)
  ecran.append(introduction, formulaire)
  entree.changer(alphabet.value, expression.value)
  valider()
  return ecran
}
