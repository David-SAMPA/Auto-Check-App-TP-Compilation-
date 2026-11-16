import type { Automate, EtatId } from '../../model/types'

export function formaterEnsemble(valeurs: string[]): string {
  return `{ ${valeurs.join(', ')} }`
}

export function formaterMot(mot: string): string {
  return mot.length > 0 ? mot : 'ε'
}

export function nomEtatAffiche(auto: Automate, id: EtatId): string {
  return auto.etats.find((etat) => etat.id === id)?.nom ?? String(id)
}

export function expliquerRefus(auto: Automate, etatFinal: EtatId): string {
  const nom = nomEtatAffiche(auto, etatFinal)
  const etatsFinaux = auto.finaux.map((id) => nomEtatAffiche(auto, id))
  const listeFinaux = etatsFinaux.length > 0 ? etatsFinaux.join(', ') : 'aucun état'
  return `Le mot a été lu jusqu’au bout, mais il se termine dans l’état « ${nom} ». Cet état n’est pas un état d’acceptation. Pour être accepté, le mot devait se terminer dans : ${listeFinaux}.`
}