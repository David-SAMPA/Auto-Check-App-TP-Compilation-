import { construireTout } from '../algo/pipeline'
import { verdict } from '../algo/reconnaissance/verdict'
import { validerAlphabet, validerExpression } from '../regex/validateur'
import { creerEtatInitial, creerMagasin, type Theme, type VueAutomate, type VitesseSimulation } from '../state/appState'
import { creerMessage } from './composants/message'
import { creerStepper } from './composants/stepper'
import { creerThemeToggle } from './composants/themeToggle'
import { creerEcranAutomates } from './ecrans/ecranAutomates'
import { creerEcranLangage } from './ecrans/ecranLangage'
import { creerEcranTest } from './ecrans/ecranTest'
import { element, bouton } from './utils/dom'

function lireThemeInitial(): Theme {
  try {
    const memorise = localStorage.getItem('auto-check-theme')
    if (memorise === 'light' || memorise === 'dark') return memorise
  } catch {
    // Le thème système reste disponible si le stockage est désactivé.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function themeValide(alphabet: string, expression: string): boolean {
  const resultatAlphabet = validerAlphabet(alphabet)
  return resultatAlphabet.ok && validerExpression(expression, resultatAlphabet.symboles).ok
}

export function monterApplication(conteneur: HTMLElement): void {
  const magasin = creerMagasin(creerEtatInitial(lireThemeInitial()))
  let minuteurSimulation: number | undefined
  const delaisSimulation: Record<VitesseSimulation, number> = { lent: 1400, normal: 850, rapide: 400 }

  const arreterSimulation = (): void => {
    if (minuteurSimulation !== undefined) {
      window.clearInterval(minuteurSimulation)
      minuteurSimulation = undefined
    }
  }

  const demarrerSimulation = (): void => {
    arreterSimulation()
    minuteurSimulation = window.setInterval(() => {
      const courant = magasin.lire()
      const total = courant.resultatMot?.chemin.transitions.length ?? 0
      if (!courant.simulationActive || total === 0 || courant.progression >= total) {
        arreterSimulation()
        if (courant.simulationActive) magasin.modifier({ simulationActive: false })
        rendre()
        return
      }
      const progression = courant.progression + 1
      const terminee = progression >= total
      magasin.modifier({ progression, simulationActive: !terminee })
      if (terminee) arreterSimulation()
      rendre()
    }, delaisSimulation[magasin.lire().vitesseSimulation])
  }

  const avancerUnPas = (): void => {
    arreterSimulation()
    const courant = magasin.lire()
    const total = courant.resultatMot?.chemin.transitions.length ?? 0
    magasin.modifier({ progression: Math.min(total, courant.progression + 1), simulationActive: false })
    rendre()
  }

  const reculerUnPas = (): void => {
    arreterSimulation()
    const courant = magasin.lire()
    magasin.modifier({ progression: Math.max(0, courant.progression - 1), simulationActive: false })
    rendre()
  }

  const recommencerSimulation = (): void => {
    const courant = magasin.lire()
    const total = courant.resultatMot?.chemin.transitions.length ?? 0
    magasin.modifier({ progression: 0, simulationActive: total > 0 })
    rendre()
    if (total > 0) demarrerSimulation()
  }

  const rendre = (): void => {
    const etat = magasin.lire()
    document.documentElement.dataset.theme = etat.theme
    const coquille = element('div', { classe: 'app-shell' })

    const entete = element('header', { classe: 'entete-app' })
    const marque = element('div', { classe: 'marque' })
    marque.append(
      element('span', { classe: 'marque-symbole', texte: 'A·C', attributs: { 'aria-hidden': 'true' } }),
      element('span', { classe: 'marque-nom', texte: 'Auto-Check' }),
    )
    const valide = etat.resultat !== null
    const stepper = creerStepper(etat.etape, valide, (etape) => {
      if (etape === 1 || valide) {
        arreterSimulation()
        magasin.modifier({ etape })
        rendre()
      }
    })
    entete.append(marque, stepper, creerThemeToggle(etat.theme, () => {
      const theme: Theme = etat.theme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('auto-check-theme', theme)
      } catch {
        // La préférence ne persiste pas si le stockage du navigateur est indisponible.
      }
      magasin.modifier({ theme })
      rendre()
    }))

    const principal = element('main', { classe: 'contenu-principal' })
    const actions = element('footer', { classe: 'barre-actions', attributs: { 'aria-label': 'Navigation du parcours' } })
    const precedent = bouton('← Précédent', 'bouton-secondaire action-precedente', () => {
      if (etat.etape > 1) {
        arreterSimulation()
        magasin.modifier({ etape: etat.etape === 3 ? 2 : 1 })
        rendre()
      }
    })
    precedent.disabled = etat.etape === 1
    const aideAction = element('p', { classe: 'aide-action' })
    const suivant = bouton(
      etat.etape === 1 ? 'Construire l’automate →' : etat.etape === 2 ? 'Tester un mot →' : 'Nouveau langage ↺',
      'bouton-primaire action-suivante',
      () => {
        const courant = magasin.lire()
        if (courant.etape === 1) {
          document.querySelector<HTMLFormElement>('#form-langage')?.requestSubmit()
          return
        }
        if (courant.etape === 2) {
          magasin.modifier({ etape: 3, mot: '', resultatMot: null, erreurMot: null, progression: 0, simulationActive: false })
          rendre()
          return
        }
        arreterSimulation()
        magasin.modifier(creerEtatInitial(courant.theme))
        rendre()
      },
    )
    suivant.disabled = etat.etape === 1 && !themeValide(etat.alphabetSaisie, etat.expression)
    if (etat.etape === 1) aideAction.textContent = 'Saisissez un alphabet et une expression valides pour continuer.'
    actions.append(precedent, aideAction, suivant)

    if (etat.etape === 1) {
      principal.append(creerEcranLangage({
        alphabet: etat.alphabetSaisie,
        expression: etat.expression,
        changer: (alphabet, expression) => magasin.modifier({ alphabetSaisie: alphabet, expression, resultat: null }),
        validite: (estValide) => {
          suivant.disabled = !estValide
          aideAction.hidden = estValide
        },
        construire: () => {
          const courant = magasin.lire()
          const resultat = construireTout(courant.alphabetSaisie, courant.expression)
          if (!resultat.ok) return
          magasin.modifier({ resultat, etape: 2, vueAutomate: 'AFD minimal', masquerPuits: false, zoom: 1 })
          rendre()
        },
      }))
    } else if (etat.resultat) {
      const resultat = etat.resultat
      if (etat.etape === 2) {
        principal.append(creerEcranAutomates({
          resultat,
          expression: etat.expression,
          vue: etat.vueAutomate,
          masquerPuits: etat.masquerPuits,
          zoom: etat.zoom,
          changerVue: (vue: VueAutomate) => {
            magasin.modifier({ vueAutomate: vue })
            rendre()
          },
          changerMasquage: (masquerPuits) => {
            magasin.modifier({ masquerPuits })
            rendre()
          },
          changerZoom: (zoom) => {
            magasin.modifier({ zoom })
            rendre()
          },
        }))
      } else {
        principal.append(creerEcranTest({
          resultat,
          expression: etat.expression,
          mot: etat.mot,
          resultatMot: etat.resultatMot,
          erreurMot: etat.erreurMot,
          historique: etat.historique,
          progression: etat.progression,
          simulationActive: etat.simulationActive,
          vitesseSimulation: etat.vitesseSimulation,
          changerVitesse: (vitesseSimulation) => {
            const active = magasin.lire().simulationActive
            magasin.modifier({ vitesseSimulation })
            rendre()
            if (active) demarrerSimulation()
          },
          basculerSimulation: () => {
            const courant = magasin.lire()
            const total = courant.resultatMot?.chemin.transitions.length ?? 0
            if (courant.simulationActive) {
              arreterSimulation()
              magasin.modifier({ simulationActive: false })
              rendre()
            } else if (courant.progression < total) {
              magasin.modifier({ simulationActive: true })
              rendre()
              demarrerSimulation()
            }
          },
          avancer: avancerUnPas,
          reculer: reculerUnPas,
          recommencer: recommencerSimulation,
          tester: (mot) => {
            arreterSimulation()
            const resultatMot = verdict(resultat.afdComplet, mot)
            if ('erreur' in resultatMot) {
              magasin.modifier({ mot, erreurMot: resultatMot.erreur, resultatMot: null, progression: 0, simulationActive: false })
            } else {
              const historique = [
                { mot, accepte: resultatMot.accepte },
                ...magasin.lire().historique.filter((entree) => entree.mot !== mot),
              ].slice(0, 20)
              const total = resultatMot.chemin.transitions.length
              magasin.modifier({
                mot,
                erreurMot: null,
                resultatMot,
                historique,
                progression: 0,
                simulationActive: total > 0,
              })
              rendre()
              if (total > 0) demarrerSimulation()
              return
            }
            rendre()
          },
        }))
      }
    } else {
      principal.append(creerMessage('info', 'Commencez par définir un alphabet et une expression.'))
    }

    const pied = element('p', { classe: 'pied-app', texte: 'Auto-Check · Calculs locaux, sans connexion réseau' })
    coquille.append(entete, principal, actions, pied)
    conteneur.replaceChildren(coquille)
  }

  rendre()
}