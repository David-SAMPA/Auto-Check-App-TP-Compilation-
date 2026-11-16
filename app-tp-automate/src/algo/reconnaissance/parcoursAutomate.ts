import type { Automate, EtatId, Transition } from '../../model/types'

export function parcourirAutomate(auto: Automate, mot: string): {
  accepte: boolean
  etats: EtatId[]
  transitions: Transition[]
} {
  let courant = auto.initial
  const etats = [courant]
  const chemin: Transition[] = []
  for (const symbole of mot) {
    const transition = auto.transitions.find((element) => element.de === courant && element.symbole === symbole)
    if (!transition) return { accepte: false, etats, transitions: chemin }
    chemin.push(transition)
    courant = transition.vers
    etats.push(courant)
  }
  return { accepte: auto.finaux.includes(courant), etats, transitions: chemin }
}