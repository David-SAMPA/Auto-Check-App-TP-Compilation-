import type { EntreeHistorique } from '../../state/appState'
import { element } from '../utils/dom'

export function creerHistorique(historique: EntreeHistorique[], retester: (mot: string) => void): HTMLElement {
  const section = element('section', { classe: 'historique', attributs: { 'aria-labelledby': 'historique-titre' } })
  section.append(element('h3', { texte: 'Historique des tests', attributs: { id: 'historique-titre' } }))
  if (historique.length === 0) {
    section.append(element('p', { classe: 'texte-secondaire', texte: 'Aucun mot testé pour le moment.' }))
    return section
  }
  const liste = element('ul', { classe: 'liste-historique' })
  for (const entree of historique) {
    const ligne = element('li')
    const bouton = element('button', {
      classe: 'historique-entree',
      texte: `${entree.accepte ? '✓ Accepté' : '✗ Refusé'} · ${entree.mot || 'ε'}`,
      attributs: { type: 'button', 'aria-label': `Retester ${entree.mot || 'le mot vide'} : ${entree.accepte ? 'accepté' : 'refusé'}` },
    })
    bouton.addEventListener('click', () => retester(entree.mot))
    ligne.append(bouton)
    liste.append(ligne)
  }
  section.append(liste)
  return section
}