import type { Theme } from '../../state/appState'
import { bouton } from '../utils/dom'

export function creerThemeToggle(theme: Theme, basculer: () => void): HTMLButtonElement {
  const texte = theme === 'dark' ? '☀' : '☾'
  const resultat = bouton(texte, 'theme-toggle', basculer)
  resultat.setAttribute('aria-label', theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre')
  resultat.title = resultat.getAttribute('aria-label') ?? ''
  return resultat
}