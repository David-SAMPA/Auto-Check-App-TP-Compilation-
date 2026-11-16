import { element } from '../utils/dom'

export function creerStepper(etapeActive: 1 | 2 | 3, valide: boolean, naviguer: (etape: 1 | 2 | 3) => void): HTMLElement {
  const nav = element('nav', { classe: 'stepper', attributs: { 'aria-label': 'Étapes du parcours' } })
  const etapes = [
    { id: 1 as const, label: 'Langage' },
    { id: 2 as const, label: 'Automates' },
    { id: 3 as const, label: 'Test' },
  ]
  for (const etape of etapes) {
    const verrouille = etape.id > etapeActive && !valide
    const boutonEtape = element('button', {
      classe: `stepper-etape${etape.id === etapeActive ? ' actif' : ''}${etape.id < etapeActive ? ' termine' : ''}${verrouille ? ' verrouille' : ''}`,
      texte: `${etape.id < etapeActive ? '✓' : etape.id} ${etape.label}`,
      attributs: { type: 'button', ...(etape.id === etapeActive ? { 'aria-current': 'step' } : {}) },
    })
    boutonEtape.disabled = verrouille || etape.id > etapeActive
    boutonEtape.addEventListener('click', () => naviguer(etape.id))
    nav.append(boutonEtape)
  }
  return nav
}