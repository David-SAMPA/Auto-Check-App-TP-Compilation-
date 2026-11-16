import type { ResultatPipeline } from '../../algo/pipeline'
import type { VueAutomate } from '../../state/appState'
import { creerLegende } from '../composants/legende'
import { creerMessage } from '../composants/message'
import { creerOnglets } from '../composants/onglets'
import { creerTableTransitions } from '../composants/tableTransitions'
import { dessinerAutomate } from '../dessin/dessinAutomate'
import { element, bouton } from '../utils/dom'
import { formaterEnsemble } from '../utils/format'

export interface EntreeAutomates {
  resultat: Extract<ResultatPipeline, { ok: true }>
  expression: string
  vue: VueAutomate
  masquerPuits: boolean
  zoom: number
  changerVue: (vue: VueAutomate) => void
  changerMasquage: (masquer: boolean) => void
  changerZoom: (zoom: number) => void
}

export function creerEcranAutomates(entree: EntreeAutomates): HTMLElement {
  const { resultat } = entree
  const ecran = element('section', { classe: 'ecran ecran-automates', attributs: { 'aria-labelledby': 'titre-automates' } })
  const introduction = element('header', { classe: 'entete-ecran entete-compacte' })
  const langageRappel = element('p', { classe: 'langage-rappel' })
  langageRappel.append(
    element('span', { texte: 'Expression' }),
    element('code', { texte: entree.expression }),
    element('span', { texte: `Symboles : ${resultat.alphabet.join(', ')}` }),
  )
  introduction.append(
    element('p', { classe: 'surtitre', texte: 'VOTRE AUTOMATE · ÉTAPE 2 SUR 3' }),
    element('h1', { texte: 'Voici votre automate', attributs: { id: 'titre-automates' } }),
    langageRappel,
  )
  if (resultat.puitsAjoute) {
    ecran.append(creerMessage('attention', 'Une transition manquante est dirigée vers p, un état de secours qui permet de compléter l’automate.'))
  }

  const onglets = creerOnglets(entree.vue, entree.changerVue)
  const automate = entree.vue === 'AFN-ε' ? resultat.afnEpsilon
    : entree.vue === 'AFD' ? resultat.afdComplet : resultat.afdMinimal
  const explicationsVues: Record<VueAutomate, string> = {
    'AFN-ε': 'La première version est construite directement à partir de votre expression.',
    AFD: 'Cette version lit une lettre à la fois et possède une transition pour chaque symbole.',
    'AFD minimal': 'Cette version regroupe les états équivalents : elle reconnaît le même langage avec moins d’états.',
  }
  const explicationVue = element('p', { classe: 'explication-vue', texte: explicationsVues[entree.vue] })
  const panneauDessin = element('section', { classe: 'panneau-dessin', attributs: { 'aria-label': `Dessin ${automate.type}` } })
  const barreDessin = element('div', { classe: 'barre-dessin' })
  barreDessin.append(element('h2', { texte: entree.vue === 'AFD minimal' ? 'Automate minimal' : automate.type }))
  const commandesZoom = element('div', { classe: 'commandes-zoom', attributs: { 'aria-label': 'Zoom du dessin' } })
  const boutonMoins = bouton('−', 'bouton-icone', () => entree.changerZoom(Math.max(0.65, entree.zoom - 0.15)))
  boutonMoins.setAttribute('aria-label', 'Réduire le dessin')
  const pourcentage = element('span', { classe: 'zoom-valeur', texte: `${Math.round(entree.zoom * 100)} %`, attributs: { 'aria-live': 'polite' } })
  const boutonPlus = bouton('+', 'bouton-icone', () => entree.changerZoom(Math.min(1.8, entree.zoom + 0.15)))
  boutonPlus.setAttribute('aria-label', 'Agrandir le dessin')
  const boutonReset = bouton('Réinitialiser', 'bouton-secondaire bouton-reset', () => entree.changerZoom(1))
  commandesZoom.append(boutonMoins, pourcentage, boutonPlus, boutonReset)
  barreDessin.append(commandesZoom)
  const zoneGraphique = element('div', { classe: 'zone-graphique', attributs: { tabindex: '0', 'aria-label': 'Automate, défilement horizontal possible' } })
  const dessin = dessinerAutomate(automate, { masquerPuits: entree.masquerPuits && entree.vue !== 'AFN-ε' })
  dessin.style.width = `${Math.max(300, dessin.viewBox.baseVal.width * entree.zoom)}px`
  dessin.style.height = 'auto'
  zoneGraphique.append(dessin)
  panneauDessin.append(barreDessin, explicationVue, zoneGraphique, creerLegende())

  const panneauInfos = element('aside', { classe: 'panneau-infos', attributs: { 'aria-label': 'Détails de l’automate' } })
  const sectionTable = element('section', { classe: 'bloc-infos' })
  sectionTable.append(
    element('h2', { texte: 'Que fait chaque lettre ?' }),
    element('p', { classe: 'aide-champ', texte: 'Chaque ligne est un état. La colonne d’une lettre indique où l’automate va quand il la lit.' }),
    creerTableTransitions(automate),
  )
  panneauInfos.append(sectionTable)

  if (entree.vue === 'AFD') {
    const composition = element('section', { classe: 'bloc-infos' })
    composition.append(element('h2', { texte: 'Composition des états' }))
    const liste = element('ul', { classe: 'liste-composition' })
    for (const etat of automate.etats) {
      const ligne = element('li')
      ligne.append(element('strong', { texte: `${etat.nom} = ` }), element('code', { texte: formaterEnsemble(etat.contenu ?? []) }))
      liste.append(ligne)
    }
    composition.append(liste)
    panneauInfos.append(composition)
  }
  if (entree.vue === 'AFD minimal') {
    const partitions = element('section', { classe: 'bloc-infos' })
    partitions.append(
      element('h2', { texte: 'Comment les états ont été regroupés' }),
      element('p', { classe: 'aide-champ', texte: 'À chaque étape, les états qui réagissent de la même façon sont réunis. Le dernier groupe est stable.' }),
    )
    const liste = element('ol', { classe: 'liste-partitions' })
    resultat.partitions.forEach((partition, index) => {
      const ligne = element('li')
      ligne.append(element('strong', { texte: `Π${index} ` }), element('span', { texte: partition.map(formaterEnsemble).join(' · ') }))
      liste.append(ligne)
    })
    partitions.append(liste)
    panneauInfos.append(partitions)
  }

  const resume = element('section', { classe: 'resume-etats', attributs: { 'aria-label': 'Résumé de minimisation' } })
  resume.append(
    element('h2', { texte: 'En bref' }),
    element('p', { texte: `${resultat.resume.etatsAfdComplet} états au départ, ${resultat.resume.etatsMinimal} après simplification.` }),
    element('p', { classe: 'texte-secondaire', texte: 'Le langage reconnu ne change pas.' }),
    element('p', { classe: 'texte-secondaire', texte: `Étapes intermédiaires : ${resultat.resume.etatsAfn} états dans le premier automate, puis ${resultat.resume.etatsAfd} dans le déterministe.` }),
  )
  panneauInfos.append(resume)

  if (resultat.puitsAjoute) {
    const controlePuits = element('label', { classe: 'controle-puits' })
    const casePuits = element('input', { attributs: { type: 'checkbox', checked: String(entree.masquerPuits) } })
    casePuits.checked = entree.masquerPuits
    casePuits.addEventListener('change', () => entree.changerMasquage(casePuits.checked))
    controlePuits.append(casePuits, element('span', { texte: 'Masquer l’état puits dans le dessin' }))
    panneauInfos.append(controlePuits)
  }

  const contenu = element('div', { classe: 'grille-automates' })
  contenu.append(panneauDessin, panneauInfos)
  ecran.prepend(introduction)
  ecran.append(onglets, contenu)
  return ecran
}