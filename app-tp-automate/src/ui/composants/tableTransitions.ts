import type { Automate } from '../../model/types'
import { element } from '../utils/dom'

export function creerTableTransitions(auto: Automate): HTMLElement {
  const cadre = element('div', { classe: 'table-scroll', attributs: { tabindex: '0', 'aria-label': 'Table de transitions, défilement horizontal possible' } })
  const table = element('table', { classe: 'table-transitions' })
  const entete = element('thead')
  const ligneEntete = element('tr')
  ligneEntete.append(element('th', { texte: 'État', attributs: { scope: 'col' } }))
  const symboles = auto.type === 'AFN-ε' ? [...auto.alphabet, 'ε'] : auto.alphabet
  for (const symbole of symboles) ligneEntete.append(element('th', { texte: symbole, attributs: { scope: 'col' } }))
  entete.append(ligneEntete)
  table.append(entete)
  const corps = element('tbody')
  for (const etat of auto.etats) {
    const ligne = element('tr')
    const nom = `${etat.id === auto.initial ? '→ ' : ''}${auto.finaux.includes(etat.id) ? '* ' : ''}${etat.nom}`
    ligne.append(element('th', { texte: nom, attributs: { scope: 'row' } }))
    for (const symbole of symboles) {
      const cibles = auto.transitions.filter((transition) => transition.de === etat.id && transition.symbole === symbole)
        .map((transition) => auto.etats.find((elementEtat) => elementEtat.id === transition.vers)?.nom ?? String(transition.vers))
      ligne.append(element('td', { texte: cibles.length > 0 ? cibles.join(', ') : '—' }))
    }
    corps.append(ligne)
  }
  table.append(corps)
  cadre.append(table)
  return cadre
}