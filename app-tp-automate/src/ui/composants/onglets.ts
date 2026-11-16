import type { VueAutomate } from '../../state/appState'
import { element } from '../utils/dom'

export function creerOnglets(active: VueAutomate, changer: (vue: VueAutomate) => void): HTMLElement {
  const nav = element('div', { classe: 'onglets', attributs: { role: 'tablist', 'aria-label': 'Vue de l’automate' } })
  const vues: VueAutomate[] = ['AFN-ε', 'AFD', 'AFD minimal']
  for (const vue of vues) {
    const onglet = element('button', {
      classe: 'onglet',
      texte: vue,
      attributs: { type: 'button', role: 'tab', 'aria-selected': String(active === vue), tabindex: active === vue ? '0' : '-1' },
    })
    onglet.addEventListener('click', () => changer(vue))
    onglet.addEventListener('keydown', (event) => {
      if (!(event instanceof KeyboardEvent) || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
      event.preventDefault()
      const index = vues.indexOf(vue)
      const prochain = vues[(index + (event.key === 'ArrowRight' ? 1 : vues.length - 1)) % vues.length]
      if (prochain) changer(prochain)
      nav.querySelectorAll<HTMLButtonElement>('[role="tab"]')[vues.indexOf(prochain ?? vue)]?.focus()
    })
    nav.append(onglet)
  }
  return nav
}