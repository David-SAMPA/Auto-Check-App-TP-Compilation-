import type { Noeud } from '../model/types'

export function versPostfixe(noeud: Noeud): string {
  switch (noeud.type) {
    case 'epsilon': return 'ε'
    case 'symbole': return noeud.symbole
    case 'union': return `${versPostfixe(noeud.gauche)}${versPostfixe(noeud.droite)}|`
    case 'concat': return `${versPostfixe(noeud.gauche)}${versPostfixe(noeud.droite)}.`
    case 'etoile': return `${versPostfixe(noeud.enfant)}*`
    case 'plus': return `${versPostfixe(noeud.enfant)}+`
    case 'option': return `${versPostfixe(noeud.enfant)}?`
  }
}