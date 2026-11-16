import type { Automate, EtatId, Transition } from '../../model/types'
import { svgElement } from '../utils/dom'
import { calculerPositions, RAYON_ETAT } from './layout'

export interface OptionsDessin {
  chemin?: { etats: EtatId[]; transitions: Transition[] }
  etatCourant?: EtatId
  masquerPuits?: boolean
}

let prochainMarqueur = 0

export function dessinerAutomate(auto: Automate, options: OptionsDessin = {}): SVGSVGElement {
  const positions = calculerPositions(auto)
  const visibles = auto.etats.filter((etat) => !(options.masquerPuits && etat.estPuits))
  const rayon = RAYON_ETAT
  const largeur = Math.max(300, ...[...positions.values()].map((position) => position.x + rayon + 48))
  const hauteur = Math.max(200, ...[...positions.values()].map((position) => position.y + rayon + 48))
  const identifiantMarqueur = `fleche-${prochainMarqueur}`
  prochainMarqueur += 1

  const svg = svgElement('svg', {
    class: 'automate-svg',
    viewBox: `0 0 ${largeur} ${hauteur}`,
    role: 'img',
    'aria-labelledby': `${identifiantMarqueur}-titre ${identifiantMarqueur}-description`,
    preserveAspectRatio: 'xMinYMin meet',
  })
  svg.append(
    svgElement('title', { id: `${identifiantMarqueur}-titre` }),
    svgElement('desc', { id: `${identifiantMarqueur}-description` }),
  )
  const titre = svg.querySelector('title')
  const description = svg.querySelector('desc')
  if (titre) titre.textContent = `Dessin de l’automate ${auto.type}`
  if (description) {
    const nomCourant = auto.etats.find((etat) => etat.id === options.etatCourant)?.nom
    description.textContent = `${auto.etats.length} états, dont ${auto.finaux.length} état(s) final(aux).${nomCourant ? ` État courant : ${nomCourant}.` : ''}`
  }

  const definitions = svgElement('defs')
  const marqueur = svgElement('marker', {
    id: identifiantMarqueur,
    markerWidth: '8',
    markerHeight: '8',
    refX: '7',
    refY: '4',
    orient: 'auto',
    markerUnits: 'strokeWidth',
  })
  marqueur.append(svgElement('path', { d: 'M 0 0 L 8 4 L 0 8 z', class: 'fleche-svg' }))
  definitions.append(marqueur)
  svg.append(definitions)

  const etatsChemin = new Set(options.chemin?.etats ?? [])
  const transitionsChemin = new Set((options.chemin?.transitions ?? []).map((transition) =>
    `${transition.de}:${transition.symbole}:${transition.vers}`,
  ))
  const liens = new Map<string, Transition[]>()
  for (const transition of auto.transitions) {
    const source = auto.etats.find((etat) => etat.id === transition.de)
    const cible = auto.etats.find((etat) => etat.id === transition.vers)
    if (!source || !cible || !visibles.includes(source) || !visibles.includes(cible)) continue
    const cle = `${transition.de}:${transition.vers}`
    const groupe = liens.get(cle) ?? []
    groupe.push(transition)
    liens.set(cle, groupe)
  }

  const groupeLiens = svgElement('g', { class: 'transitions-svg' })
  for (const transitions of liens.values()) {
    const premiere = transitions[0]
    if (!premiere) continue
    const source = positions.get(premiere.de)
    const cible = positions.get(premiere.vers)
    if (!source || !cible) continue
    const estBoucle = premiere.de === premiere.vers
    const estRetour = cible.x <= source.x
    const surligne = transitions.some((transition) => transitionsChemin.has(
      `${transition.de}:${transition.symbole}:${transition.vers}`,
    ))
    let chemin = ''
    let etiquetteX = 0
    let etiquetteY = 0
    if (estBoucle) {
      chemin = `M ${source.x - 12} ${source.y - rayon + 2} C ${source.x - 48} ${source.y - 64}, ${source.x + 48} ${source.y - 64}, ${source.x + 12} ${source.y - rayon + 2}`
      etiquetteX = source.x
      etiquetteY = source.y - 55
    } else if (estRetour) {
      const profondeur = Math.max(48, Math.abs(source.x - cible.x) * 0.34 + 38)
      const milieuX = (source.x + cible.x) / 2
      const milieuY = (source.y + cible.y) / 2 + profondeur
      chemin = `M ${source.x} ${source.y + rayon} Q ${milieuX} ${milieuY + rayon}, ${cible.x} ${cible.y + rayon}`
      etiquetteX = milieuX
      etiquetteY = milieuY + 10
    } else {
      const dx = cible.x - source.x
      const dy = cible.y - source.y
      const longueur = Math.hypot(dx, dy) || 1
      const debutX = source.x + dx / longueur * rayon
      const debutY = source.y + dy / longueur * rayon
      const finX = cible.x - dx / longueur * rayon
      const finY = cible.y - dy / longueur * rayon
      chemin = `M ${debutX} ${debutY} L ${finX} ${finY}`
      etiquetteX = (debutX + finX) / 2
      etiquetteY = (debutY + finY) / 2 - 11
    }
    const epsilon = transitions.some((transition) => transition.symbole === 'ε')
    groupeLiens.append(svgElement('path', {
      d: chemin,
      class: `transition-svg${surligne ? ' chemin' : ''}${epsilon ? ' epsilon' : ''}`,
      'marker-end': `url(#${identifiantMarqueur})`,
    }))
    const texte = svgElement('text', {
      x: String(etiquetteX),
      y: String(etiquetteY),
      class: `etiquette-transition${epsilon ? ' etiquette-epsilon' : ''}${surligne ? ' chemin' : ''}`,
      'text-anchor': 'middle',
    })
    texte.textContent = [...new Set(transitions.map((transition) => transition.symbole))].join(', ')
    groupeLiens.append(texte)
  }
  svg.append(groupeLiens)

  if (positions.has(auto.initial)) {
    const position = positions.get(auto.initial)
    if (position) {
      const entree = svgElement('g', { class: 'entree-initiale' })
      entree.append(
        svgElement('path', {
          d: `M 8 ${position.y} L ${position.x - rayon - 4} ${position.y}`,
          class: 'transition-svg',
          'marker-end': `url(#${identifiantMarqueur})`,
        }),
      )
      const etiquette = svgElement('text', { x: '10', y: String(position.y - 9), class: 'etiquette-initiale' })
      etiquette.textContent = 'initial'
      entree.append(etiquette)
      svg.append(entree)
    }
  }

  const groupeEtats = svgElement('g', { class: 'etats-svg' })
  for (const etat of visibles) {
    const position = positions.get(etat.id)
    if (!position) continue
    const estFinal = auto.finaux.includes(etat.id)
    const classes = [
      'etat-svg',
      etat.id === auto.initial ? 'initial' : '',
      estFinal ? 'final' : '',
      etat.estPuits ? 'puits' : '',
      etatsChemin.has(etat.id) ? 'chemin' : '',
      etat.id === options.etatCourant ? 'courant' : '',
    ].filter(Boolean).join(' ')
    const groupe = svgElement('g', { class: classes })
    if (etat.id === options.etatCourant) {
      groupe.append(svgElement('circle', {
        cx: String(position.x), cy: String(position.y), r: String(rayon + 7), class: 'halo-courant',
      }))
    }
    groupe.append(svgElement('circle', { cx: String(position.x), cy: String(position.y), r: String(rayon) }))
    if (estFinal) {
      groupe.append(svgElement('circle', {
        cx: String(position.x), cy: String(position.y), r: String(rayon - 5), class: 'cercle-final-interieur',
      }))
    }
    const nom = svgElement('text', { x: String(position.x), y: String(position.y + 5), 'text-anchor': 'middle' })
    nom.textContent = etat.nom
    groupe.append(nom)
    groupeEtats.append(groupe)
  }
  svg.append(groupeEtats)
  return svg
}