import type { ResultatPipeline } from '../algo/pipeline'
import type { verdict } from '../algo/reconnaissance/verdict'
import type { ErreurSaisie } from '../model/types'

export type VueAutomate = 'AFN-ε' | 'AFD' | 'AFD minimal'
export type VitesseSimulation = 'lent' | 'normal' | 'rapide'
export type ResultatMot = Exclude<ReturnType<typeof verdict>, { erreur: unknown }>

export interface EntreeHistorique {
  mot: string
  accepte: boolean
}

export interface AppState {
  etape: 1 | 2 | 3
  alphabetSaisie: string
  expression: string
  resultat: Extract<ResultatPipeline, { ok: true }> | null
  vueAutomate: VueAutomate
  masquerPuits: boolean
  zoom: number
  mot: string
  resultatMot: ResultatMot | null
  erreurMot: ErreurSaisie | null
  progression: number
  simulationActive: boolean
  vitesseSimulation: VitesseSimulation
  historique: EntreeHistorique[]
}

export function creerEtatInitial(): AppState {
  return {
    etape: 1,
    alphabetSaisie: 'a, b',
    expression: '(a|b)*abb',
    resultat: null,
    vueAutomate: 'AFD minimal',
    masquerPuits: false,
    zoom: 1,
    mot: '',
    resultatMot: null,
    erreurMot: null,
    progression: 0,
    simulationActive: false,
    vitesseSimulation: 'lent',
    historique: [],
  }
}

export function creerMagasin(initial: AppState): {
  lire: () => AppState
  modifier: (miseAJour: Partial<AppState>) => void
  abonner: (ecouteur: (etat: AppState) => void) => () => void
} {
  let etat = initial
  const ecouteurs = new Set<(etat: AppState) => void>()
  return {
    lire: () => etat,
    modifier: (miseAJour) => {
      etat = { ...etat, ...miseAJour }
      for (const ecouteur of ecouteurs) ecouteur(etat)
    },
    abonner: (ecouteur) => {
      ecouteurs.add(ecouteur)
      return () => ecouteurs.delete(ecouteur)
    },
  }
}