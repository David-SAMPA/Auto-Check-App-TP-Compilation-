import { element } from '../utils/dom'

export function creerLegende(): HTMLElement {
  const legende = element('ul', { classe: 'legende', attributs: { 'aria-label': 'Légende du dessin' } })
  for (const [classe, texte] of [
    ['legende-initial', 'État initial'],
    ['legende-final', 'État final'],
    ['legende-puits', 'État puits'],
    ['legende-chemin', 'Chemin parcouru'],
  ]) {
    const ligne = element('li')
    ligne.append(element('span', { classe: `legende-echantillon ${classe}`, attributs: { 'aria-hidden': 'true' } }), element('span', { texte }))
    legende.append(ligne)
  }
  return legende
}