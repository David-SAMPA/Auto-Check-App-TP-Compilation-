export interface OptionsElement {
  classe?: string
  texte?: string
  attributs?: Record<string, string>
}

export function element<K extends keyof HTMLElementTagNameMap>(
  balise: K,
  options: OptionsElement = {},
): HTMLElementTagNameMap[K] {
  const resultat = document.createElement(balise)
  if (options.classe) resultat.className = options.classe
  if (options.texte !== undefined) resultat.textContent = options.texte
  for (const [nom, valeur] of Object.entries(options.attributs ?? {})) resultat.setAttribute(nom, valeur)
  return resultat
}

export function bouton(texte: string, classe: string, action: () => void): HTMLButtonElement {
  const resultat = element('button', { classe, texte, attributs: { type: 'button' } })
  resultat.addEventListener('click', action)
  return resultat
}

export function svgElement<K extends keyof SVGElementTagNameMap>(
  balise: K,
  attributs: Record<string, string> = {},
): SVGElementTagNameMap[K] {
  const resultat = document.createElementNS('http://www.w3.org/2000/svg', balise)
  for (const [nom, valeur] of Object.entries(attributs)) resultat.setAttribute(nom, valeur)
  return resultat
}