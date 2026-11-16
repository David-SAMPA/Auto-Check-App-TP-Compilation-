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

function afficherValidation(zone: HTMLElement, expression: string, erreur?: ErreurSaisie): void {
  zone.replaceChildren()
  if (erreur) {
    zone.append(creerMessage('erreur', erreur.message))
    if (erreur.position !== undefined) zone.append(apercuExpression(expression, erreur.position))
    return
  }
  zone.append(creerMessage('succes', 'Expression valide'))
}

export function creerEcranLangage(entree: EntreeLangage): HTMLElement {
  const ecran = element('section', { classe: 'ecran ecran-langage', attributs: { 'aria-labelledby': 'titre-langage' } })
  const introduction = element('header', { classe: 'entete-ecran' })
  introduction.append(
    element('p', { classe: 'surtitre', texte: 'VOTRE LANGAGE · ÉTAPE 1 SUR 3' }),
    element('h1', { texte: 'Quels mots voulez-vous reconnaître ?', attributs: { id: 'titre-langage' } }),
    element('p', { classe: 'texte-secondaire', texte: 'Commencez par choisir les symboles possibles, puis décrivez les mots que vous voulez accepter. Nous construirons ensuite l’automate avec vous.' }),
  )

  const formulaire = element('form', { classe: 'formulaire-langage', attributs: { id: 'form-langage', novalidate: 'true' } })
  const champAlphabet = element('div', { classe: 'champ' })
  const etiquetteAlphabet = element('label', { texte: 'Alphabet', attributs: { for: 'champ-alphabet' } })
  const alphabet = element('input', {
    classe: 'champ-texte champ-mono',
    attributs: {
      id: 'champ-alphabet', type: 'text', value: entree.alphabet,
      placeholder: 'a, b', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
      'aria-describedby': 'aide-alphabet erreur-alphabet',
    },
  })
  const aideAlphabet = element('p', { classe: 'aide-champ', texte: 'L’alphabet est la liste des symboles autorisés. Séparez-les par une virgule ou un espace.', attributs: { id: 'aide-alphabet' } })
  const erreurAlphabet = element('div', { classe: 'zone-validation', attributs: { id: 'erreur-alphabet' } })
  const apercuAlphabet = element('div', { classe: 'apercu-alphabet', attributs: { 'aria-live': 'polite' } })
  champAlphabet.append(etiquetteAlphabet, alphabet, aideAlphabet, erreurAlphabet, apercuAlphabet)

  const champExpression = element('div', { classe: 'champ' })
  const etiquetteExpression = element('label', { texte: 'Expression régulière', attributs: { for: 'champ-expression' } })
  const expression = element('input', {
    classe: 'champ-texte champ-mono',
    attributs: {
      id: 'champ-expression', type: 'text', value: entree.expression,
      placeholder: '(a|b)*abb', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
      'aria-describedby': 'aide-expression etat-validation',
    },
  })
  const aideExpression = element('p', { classe: 'aide-champ', texte: 'Décrivez la forme d’un mot accepté. Les espaces sont ignorés.', attributs: { id: 'aide-expression' } })
  const zoneValidation = element('div', { classe: 'zone-validation', attributs: { id: 'etat-validation' } })
  champExpression.append(etiquetteExpression, expression, aideExpression, zoneValidation)

  const exemples = element('div', { classe: 'exemples' })
  exemples.append(element('span', { classe: 'libelle-secondaire', texte: 'Essayer :' }))
  for (const exemple of ['(a|b)*abb', 'a*b', '(ab)*']) {
    const boutonExemple = element('button', { classe: 'bouton-exemple champ-mono', texte: exemple, attributs: { type: 'button' } })
    boutonExemple.addEventListener('click', () => {
      expression.value = exemple
      actualiser()
      expression.focus()
    })
    exemples.append(boutonExemple)
  }

  const syntaxe = element('details', { classe: 'rappel-syntaxe' })
  syntaxe.append(element('summary', { texte: 'Besoin d’aide sur les opérateurs ?' }))
  const contenuSyntaxe = element('div', { classe: 'contenu-syntaxe' })
  contenuSyntaxe.append(element('h2', { texte: 'Opérateurs disponibles' }))
  const listeSyntaxe = element('ul', { classe: 'liste-syntaxe' })
  for (const [symbole, libelle] of [
    ['|', 'union'], ['*', 'zéro ou plus'], ['+', 'une fois ou plus'], ['?', 'optionnel'],
    ['( )', 'groupement'], ['ε', 'mot vide'],
  ]) {
    const ligne = element('li')
    ligne.append(element('code', { texte: symbole }), element('span', { texte: libelle }))
    listeSyntaxe.append(ligne)
  }
  contenuSyntaxe.append(listeSyntaxe)
  syntaxe.append(contenuSyntaxe)

  const valider = (): boolean => {
    const alphabetValide = validerAlphabet(alphabet.value)
    alphabet.setAttribute('aria-invalid', String(!alphabetValide.ok))
    if (!alphabetValide.ok) {
      erreurAlphabet.replaceChildren(creerMessage('erreur', alphabetValide.erreur.message))
      expression.setAttribute('aria-invalid', 'false')
      zoneValidation.replaceChildren()
      entree.validite(false)
      return false
    }
    erreurAlphabet.replaceChildren()
    const expressionValide = validerExpression(expression.value, alphabetValide.symboles)
    expression.setAttribute('aria-invalid', String(!expressionValide.ok))
    if (!expressionValide.ok) {
      afficherValidation(zoneValidation, expression.value, expressionValide.erreur)
      entree.validite(false)
      return false
    }
    afficherValidation(zoneValidation, expression.value)
    entree.validite(true)
    return true
  }

  const boutonValider = element('button', {
    classe: 'bouton-secondaire', texte: 'Valider', attributs: { type: 'button' },
  })
  boutonValider.addEventListener('click', () => valider())

  let temporisateurValidation: number | undefined
  const actualiser = (): void => {
    entree.changer(alphabet.value, expression.value)
    apercuAlphabet.replaceChildren()
    const resultatAlphabet = validerAlphabet(alphabet.value)
    if (resultatAlphabet.ok) {
      apercuAlphabet.append(element('span', {
        classe: 'libelle-secondaire',
        texte: `${resultatAlphabet.symboles.length} symbole${resultatAlphabet.symboles.length === 1 ? '' : 's'} autorisé${resultatAlphabet.symboles.length === 1 ? '' : 's'} :`,
      }))
      for (const symbole of resultatAlphabet.symboles) {
        apercuAlphabet.append(element('code', { classe: 'symbole-apercu', texte: symbole }))
      }
    }
    window.clearTimeout(temporisateurValidation)
    temporisateurValidation = window.setTimeout(() => valider(), 160)
  }
  alphabet.addEventListener('input', actualiser)
  expression.addEventListener('input', actualiser)
  formulaire.addEventListener('submit', (event) => {
    event.preventDefault()
    if (valider()) entree.construire()
  })
  const soumissionClavier = element('button', {
    classe: 'soumission-invisible', texte: 'Construire l’automate',
    attributs: { type: 'submit', 'aria-hidden': 'true', tabindex: '-1' },
  })
  formulaire.append(champAlphabet, champExpression, boutonValider, exemples, syntaxe, soumissionClavier)
  ecran.append(introduction, formulaire)
  actualiser()
  valider()
  return ecran
}