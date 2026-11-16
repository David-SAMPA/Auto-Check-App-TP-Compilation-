import type { ResultatPipeline } from '../../algo/pipeline'
import type { ErreurSaisie } from '../../model/types'
import type { EntreeHistorique, ResultatMot, VitesseSimulation } from '../../state/appState'
import { formaterConfigurations } from '../../algo/reconnaissance/configurations'
import { creerHistorique } from '../composants/historique'
import { creerMessage } from '../composants/message'
import { dessinerAutomate } from '../dessin/dessinAutomate'
import { element } from '../utils/dom'
import { expliquerRefus, formaterMot, nomEtatAffiche } from '../utils/format'

export interface EntreeTest {
  resultat: Extract<ResultatPipeline, { ok: true }>
  expression: string
  mot: string
  resultatMot: ResultatMot | null
  erreurMot: ErreurSaisie | null
  historique: EntreeHistorique[]
  tester: (mot: string) => void
  progression: number
  simulationActive: boolean
  vitesseSimulation: VitesseSimulation
  changerVitesse: (vitesse: VitesseSimulation) => void
  basculerSimulation: () => void
  avancer: () => void
  reculer: () => void
  recommencer: () => void
}

export function creerEcranTest(entree: EntreeTest): HTMLElement {
  const { resultat } = entree
  const ecran = element('section', { classe: 'ecran ecran-test', attributs: { 'aria-labelledby': 'titre-test' } })
  const introduction = element('header', { classe: 'entete-ecran entete-compacte' })
  const langageRappel = element('p', { classe: 'langage-rappel' })
  langageRappel.append(
    element('span', { texte: `Expression : ${entree.expression}` }),
    element('span', { texte: `Σ = { ${resultat.alphabet.join(', ')} }` }),
  )
  introduction.append(
    element('p', { classe: 'surtitre', texte: 'VOTRE TEST · ÉTAPE 3 SUR 3' }),
    element('h1', { texte: 'Ce mot est-il reconnu ?', attributs: { id: 'titre-test' } }),
    langageRappel,
  )

  const colonneResultat = element('div', { classe: 'colonne-resultat' })
  const formulaire = element('form', { classe: 'formulaire-test', attributs: { id: 'form-test', novalidate: 'true' } })
  const champ = element('div', { classe: 'champ' })
  champ.append(element('label', { texte: 'Mot à reconnaître', attributs: { for: 'champ-mot' } }))
  const mot = element('input', {
    classe: 'champ-texte champ-mono',
    attributs: {
      id: 'champ-mot', type: 'text', value: entree.mot, placeholder: 'aabb ou ε',
      autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
      'aria-describedby': 'aide-mot erreur-mot',
    },
  })
  champ.append(mot, element('p', { classe: 'aide-champ', texte: 'Laissez vide pour tester ε.', attributs: { id: 'aide-mot' } }))
  const erreur = element('div', { classe: 'zone-validation', attributs: { id: 'erreur-mot' } })
  if (entree.erreurMot) {
    erreur.append(creerMessage('erreur', entree.erreurMot.message))
    if (entree.erreurMot.code === 'MOT_HORS_ALPHABET') {
      const symboleInconnu = [...entree.mot].find((symbole) => !resultat.alphabet.includes(symbole))
      const detailAlphabet = symboleInconnu
        ? `« ${symboleInconnu} » n’est pas autorisé. Les symboles possibles sont ${resultat.alphabet.join(', ')}. Remplacez-le ou revenez à l’étape 1 pour modifier l’alphabet.`
        : `Les symboles possibles sont ${resultat.alphabet.join(', ')}. Enlevez du mot toute lettre qui ne figure pas dans cette liste.`
      erreur.append(element('p', { classe: 'explication-refus', texte: detailAlphabet }))
    }
  }
  const boutonTester = element('button', { classe: 'bouton-primaire', texte: 'Tester le mot', attributs: { type: 'submit' } })
  formulaire.append(champ, erreur, boutonTester)
  const exemples = element('div', { classe: 'exemples-mots' })
  exemples.append(element('p', { classe: 'libelle-secondaire', texte: 'Pour essayer rapidement :' }))
  if (entree.expression === '(a|b)*abb' && resultat.alphabet.join(',') === 'a,b') {
    for (const [exemple, accepte] of [['aabb', true], ['babb', true], ['abba', false], ['ab', false]] as const) {
      const boutonExemple = element('button', {
        classe: `bouton-exemple champ-mono${accepte ? ' exemple-accepte' : ' exemple-refuse'}`,
        texte: `${accepte ? '✓' : '×'} ${exemple}`,
        attributs: { type: 'button', 'aria-label': `Tester ${exemple}, ${accepte ? 'mot accepté' : 'mot refusé'}` },
      })
      boutonExemple.addEventListener('click', () => entree.tester(exemple))
      exemples.append(boutonExemple)
    }
  } else {
    exemples.append(element('p', { classe: 'aide-champ', texte: 'Entrez n’importe quel mot composé des symboles de l’alphabet ci-dessus.' }))
  }
  const explicationTest = element('p', {
    classe: 'explication-test',
    texte: 'Le mot est lu lettre par lettre. Il est accepté si l’automate termine dans un état final.',
  })
  formulaire.addEventListener('submit', (event) => {
    event.preventDefault()
    entree.tester(mot.value === 'ε' ? '' : mot.value)
  })
  colonneResultat.append(formulaire, explicationTest, exemples)

  const nombrePas = entree.resultatMot?.chemin.transitions.length ?? 0
  const progression = Math.min(entree.progression, nombrePas)
  const etatsChemin = entree.resultatMot?.chemin.etats ?? [resultat.afdComplet.initial]
  const etatCourant = etatsChemin[Math.min(progression, etatsChemin.length - 1)] ?? resultat.afdComplet.initial
  const nomEtatCourant = resultat.afdComplet.etats.find((etat) => etat.id === etatCourant)?.nom ?? String(etatCourant)
  const symboleCourant = [...entree.mot][progression]
  const simulation = element('section', { classe: 'simulation-mot', attributs: { 'aria-labelledby': 'titre-simulation' } })
  simulation.append(element('h2', { texte: 'Parcours en direct', attributs: { id: 'titre-simulation' } }))
  if (!entree.resultatMot) {
    simulation.append(element('p', { classe: 'aide-champ', texte: 'Lancez un test pour voir chaque lettre avancer sur l’automate.' }))
  } else {
    const etape = element('p', {
      classe: 'simulation-etape',
      texte: nombrePas === 0
        ? 'Mot vide · aucun déplacement'
        : progression >= nombrePas ? `Étape ${nombrePas} sur ${nombrePas}` : `Étape ${progression + 1} sur ${nombrePas}`,
      attributs: { 'aria-live': 'polite' },
    })
    const barreProgression = element('progress', {
      classe: 'barre-progression',
      attributs: {
        max: String(Math.max(1, nombrePas)),
        value: String(nombrePas === 0 ? 1 : progression),
        'aria-label': 'Progression de la lecture du mot',
      },
    })
    const ruban = element('div', { classe: 'ruban-mot', attributs: { 'aria-label': 'Lettres du mot en cours de lecture' } })
    const symbolesMot = [...entree.mot]
    if (symbolesMot.length === 0) {
      ruban.append(element('span', { classe: 'symbole-mot vide', texte: 'ε', attributs: { 'aria-label': 'mot vide' } }))
    } else {
      symbolesMot.forEach((symbole, index) => {
        const classe = index < progression ? 'lu' : index === progression && progression < nombrePas ? 'courant' : 'reste'
        ruban.append(element('span', {
          classe: `symbole-mot ${classe}`,
          texte: symbole,
          attributs: { 'aria-label': `${symbole}, ${classe === 'lu' ? 'lu' : classe === 'courant' ? 'en cours' : 'à lire'}` },
        }))
      })
    }
    const detailEtape = element('p', {
      classe: 'detail-simulation',
      texte: nombrePas === 0
        ? `L’automate reste dans l’état ${nomEtatCourant}.`
        : progression >= nombrePas
          ? `Toutes les lettres sont lues. L’automate est dans l’état ${nomEtatCourant}.`
          : `Lecture de « ${symboleCourant ?? ''} » depuis l’état ${nomEtatCourant}.`,
      attributs: { 'aria-live': 'polite' },
    })
    const commandes = element('div', { classe: 'commandes-simulation', attributs: { 'aria-label': 'Commandes de simulation' } })
    const precedent = element('button', {
      classe: 'bouton-secondaire commande-pas', texte: '← Précédent',
      attributs: { type: 'button', id: 'simulation-precedent' },
    })
    precedent.disabled = progression === 0
    precedent.addEventListener('click', entree.reculer)
    const lecture = element('button', {
      classe: 'bouton-primaire commande-lecture',
      texte: entree.simulationActive ? 'Ⅱ Pause' : progression >= nombrePas ? '✓ Terminé' : '▶ Reprendre',
      attributs: { type: 'button', id: 'simulation-lecture', 'aria-pressed': String(entree.simulationActive) },
    })
    lecture.disabled = progression >= nombrePas
    lecture.addEventListener('click', entree.basculerSimulation)
    const suivant = element('button', {
      classe: 'bouton-secondaire commande-pas', texte: 'Suivant →',
      attributs: { type: 'button', id: 'simulation-suivant' },
    })
    suivant.disabled = progression >= nombrePas
    suivant.addEventListener('click', entree.avancer)
    const recommencer = element('button', {
      classe: 'bouton-secondaire commande-recommencer', texte: '↺ Recommencer',
      attributs: { type: 'button', id: 'simulation-recommencer' },
    })
    recommencer.addEventListener('click', entree.recommencer)
    commandes.append(precedent, lecture, suivant, recommencer)
    const choixVitesse = element('div', {
      classe: 'choix-vitesse',
      attributs: { role: 'group', 'aria-label': 'Vitesse de lecture' },
    })
    choixVitesse.append(element('span', { classe: 'libelle-secondaire', texte: 'Rythme' }))
    for (const [vitesse, libelle] of [
      ['lent', 'Lent'], ['normal', 'Normal'], ['rapide', 'Rapide'],
    ] as const) {
      const option = element('button', {
        classe: 'option-vitesse',
        texte: libelle,
        attributs: { type: 'button', 'aria-pressed': String(entree.vitesseSimulation === vitesse) },
      })
      option.addEventListener('click', () => entree.changerVitesse(vitesse))
      choixVitesse.append(option)
    }
    simulation.append(etape, barreProgression, ruban, detailEtape, choixVitesse, commandes)
  }
  colonneResultat.append(simulation)

  const simulationTerminee = Boolean(entree.resultatMot && progression >= nombrePas)
  if (entree.resultatMot && simulationTerminee) {
    const resultatMot = entree.resultatMot
    const zoneVerdict = element('section', {
      classe: `verdict verdict-${resultatMot.accepte ? 'accepte' : 'refuse'}`,
      attributs: { role: 'status', 'aria-live': 'polite' },
    })
    const contenuVerdict = element('div')
    const titreVerdict = element('h2')
    titreVerdict.append(
      element('strong', { texte: formaterMot(entree.mot) }),
      document.createTextNode(resultatMot.accepte ? ' appartient au langage' : ' n’appartient pas au langage'),
    )
    contenuVerdict.append(
      element('p', { classe: 'surtitre', texte: resultatMot.accepte ? 'MOT ACCEPTÉ' : 'MOT REFUSÉ' }),
      titreVerdict,
    )
    if (!resultatMot.accepte) {
      const etatArret = resultatMot.chemin.etats.at(-1) ?? resultat.afdComplet.initial
      contenuVerdict.append(element('p', {
        classe: 'explication-refus',
        texte: expliquerRefus(resultat.afdComplet, etatArret),
      }))
    } else {
      contenuVerdict.append(element('p', {
        classe: 'explication-verdict',
        texte: `La lecture se termine dans l’état final ${nomEtatAffiche(resultat.afdComplet, resultatMot.chemin.etats.at(-1) ?? resultat.afdComplet.initial)} : le mot est accepté.`,
      }))
    }
    zoneVerdict.append(
      element('span', { classe: 'verdict-icone', texte: resultatMot.accepte ? '✓' : '✗', attributs: { 'aria-hidden': 'true' } }),
      contenuVerdict,
    )
    colonneResultat.append(zoneVerdict)

    const methodes = element('section', { classe: 'methodes-verification', attributs: { 'aria-labelledby': 'titre-methodes' } })
    methodes.append(element('h2', { texte: 'Vérification croisée', attributs: { id: 'titre-methodes' } }))
    const listeMethodes = element('ul', { classe: 'liste-methodes' })
    const explicationsMethodes: Record<string, string> = {
      'Algorithme du cours': 'lit le mot lettre par lettre',
      Configurations: 'montre les lettres qu’il reste à lire',
      "Parcours de l'automate": 'suit les flèches du dessin',
    }
    for (const methode of resultatMot.methodes) {
      const ligne = element('li', { classe: methode.accepte ? 'methode-ok' : 'methode-non' })
      const description = element('span', { classe: 'methode-description' })
      description.append(
        element('strong', { texte: methode.nom }),
        element('span', { texte: explicationsMethodes[methode.nom] ?? '' }),
      )
      ligne.append(
        element('span', { classe: 'methode-icone', texte: methode.accepte ? '✓' : '✗', attributs: { 'aria-hidden': 'true' } }),
        description,
      )
      listeMethodes.append(ligne)
    }
    methodes.append(listeMethodes)
    if (!resultatMot.concordance) methodes.append(creerMessage('erreur', 'Les trois méthodes ne donnent pas la même réponse : anomalie détectée.'))
    else methodes.append(creerMessage('succes', 'Les trois méthodes donnent le même résultat.'))
    colonneResultat.append(methodes)

    const configurations = element('section', { classe: 'configurations', attributs: { 'aria-labelledby': 'titre-configurations' } })
    configurations.append(
      element('h2', { texte: 'Séquence de configurations', attributs: { id: 'titre-configurations' } }),
      element('p', { classe: 'formule-secondaire', texte: 'Chaque étape montre l’état courant et les lettres qu’il reste à lire.' }),
      element('p', {
        classe: 'trace-configurations champ-mono',
        texte: formaterConfigurations(resultatMot.configurations, resultat.afdComplet, resultat.correspondance),
        attributs: { tabindex: '0', 'aria-label': 'Séquence des configurations, défilement horizontal possible' },
      }),
    )
    colonneResultat.append(configurations)
  }
  colonneResultat.append(creerHistorique(entree.historique, entree.tester))

  const colonneDessin = element('section', { classe: 'panneau-dessin panneau-dessin-test', attributs: { 'aria-label': 'Automate et chemin parcouru' } })
  const barreDessin = element('div', { classe: 'barre-dessin' })
  barreDessin.append(element('h2', { texte: 'Parcours de l’automate' }))
  colonneDessin.append(barreDessin)
  const zoneGraphique = element('div', { classe: 'zone-graphique', attributs: { tabindex: '0', 'aria-label': 'Dessin de l’automate, défilement horizontal possible' } })
  const cheminPartiel = entree.resultatMot
    ? {
        etats: entree.resultatMot.chemin.etats.slice(0, progression + 1),
        transitions: entree.resultatMot.chemin.transitions.slice(0, progression),
      }
    : undefined
  zoneGraphique.append(dessinerAutomate(resultat.afdComplet, {
    chemin: cheminPartiel,
    ...(entree.resultatMot ? { etatCourant } : {}),
  }))
  colonneDessin.append(zoneGraphique)
  const legende = element('p', { classe: 'legende-chemin', texte: 'Le trajet du mot testé apparaît en orange.' })
  colonneDessin.append(legende)

  const contenu = element('div', { classe: 'grille-test' })
  contenu.append(colonneResultat, colonneDessin)
  ecran.append(introduction, contenu)
  return ecran
}