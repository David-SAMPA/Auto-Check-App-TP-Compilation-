import { creerAutomate, etatsAccessibles, tableDeterministe } from '../../model/automate'
import type { Automate, EtatId, Symbole } from '../../model/types'

type Partition = EtatId[][]

function memePartition(gauche: Partition, droite: Partition): boolean {
  if (gauche.length !== droite.length) return false
  const signature = (partition: Partition): string[] => partition
    .map((groupe) => [...groupe].sort((a, b) => a - b).join(','))
    .sort()
  return signature(gauche).every((groupe, index) => groupe === signature(droite)[index])
}

function nomsPartition(partition: Partition, auto: Automate): string[][] {
  return partition.map((groupe) => groupe.map((id) => auto.etats.find((etat) => etat.id === id)?.nom ?? String(id)))
}

export function minimiser(afdComplet: Automate): {
  afdMinimal: Automate
  partitions: string[][][]
  correspondance: Record<string, string>
} {
  if (!afdComplet.alphabet.every((symbole) => afdComplet.etats.every((etat) =>
    afdComplet.transitions.some((transition) => transition.de === etat.id && transition.symbole === symbole)))) {
    throw new Error('La minimisation exige un AFD complet')
  }

  const accessibles = etatsAccessibles(afdComplet)
  const etats = afdComplet.etats.filter((etat) => accessibles.has(etat.id))
  const finaux = etats.filter((etat) => afdComplet.finaux.includes(etat.id)).map((etat) => etat.id)
  const nonFinaux = etats.filter((etat) => !afdComplet.finaux.includes(etat.id)).map((etat) => etat.id)
  let partition: Partition = [finaux, nonFinaux].filter((groupe) => groupe.length > 0)
  const historique: string[][][] = [nomsPartition(partition, afdComplet)]
  const table = tableDeterministe(afdComplet)

  while (true) {
    const indiceGroupe = new Map<EtatId, number>()
    partition.forEach((groupe, index) => groupe.forEach((id) => indiceGroupe.set(id, index)))
    const suivante: Partition = []
    for (const groupe of partition) {
      const classes = new Map<string, EtatId[]>()
      for (const id of groupe) {
        const signature = afdComplet.alphabet.map((symbole) => {
          const cible = table.get(id)?.get(symbole)
          const indice = cible === undefined ? -1 : indiceGroupe.get(cible) ?? -1
          return `${symbole}:${indice}`
        }).join('|')
        const classe = classes.get(signature) ?? []
        classe.push(id)
        classes.set(signature, classe)
      }
      suivante.push(...classes.values())
    }
    historique.push(nomsPartition(suivante, afdComplet))
    const stable = memePartition(partition, suivante)
    partition = suivante
    if (stable) break
  }

  const groupeParEtat = new Map<EtatId, number>()
  partition.forEach((groupe, index) => groupe.forEach((id) => groupeParEtat.set(id, index)))
  const groupeInitial = groupeParEtat.get(afdComplet.initial)
  if (groupeInitial === undefined) throw new Error('L’état initial est inaccessible')
  const ordreGroupes = [groupeInitial]
  const vus = new Set(ordreGroupes)
  const correspondance: Record<string, string> = {}
  const idParGroupe = new Map<number, number>()

  for (let index = 0; index < ordreGroupes.length; index += 1) {
    const groupeIndex = ordreGroupes[index]
    if (groupeIndex === undefined) continue
    idParGroupe.set(groupeIndex, index)
    const groupe = partition[groupeIndex]
    const representant = groupe?.[0]
    if (representant === undefined) continue
    for (const etat of etats.filter((element) => groupe?.includes(element.id))) {
      correspondance[etat.nom] = `q${index}`
    }
    for (const symbole of afdComplet.alphabet) {
      const cible = table.get(representant)?.get(symbole)
      const cibleGroupe = cible === undefined ? undefined : groupeParEtat.get(cible)
      if (cibleGroupe !== undefined && !vus.has(cibleGroupe)) {
        vus.add(cibleGroupe)
        ordreGroupes.push(cibleGroupe)
      }
    }
  }
  ordreGroupes.forEach((groupe, index) => idParGroupe.set(groupe, index))
  const etatsMinimaux = ordreGroupes.map((groupeIndex, id) => {
    const membres = partition[groupeIndex] ?? []
    const noms = membres.map((membre) => afdComplet.etats.find((etat) => etat.id === membre)?.nom ?? String(membre))
    const contientPuits = membres.some((membre) => afdComplet.etats.find((etat) => etat.id === membre)?.estPuits)
    return { id, nom: `q${id}`, contenu: noms, estPuits: contientPuits }
  })
  const transitionsMinimales = etatsMinimaux.flatMap((etat) => {
    const groupeIndex = ordreGroupes[etat.id]
    const representant = partition[groupeIndex ?? -1]?.[0]
    if (representant === undefined) return []
    return afdComplet.alphabet.flatMap((symbole: Symbole) => {
      const cible = table.get(representant)?.get(symbole)
      const cibleGroupe = cible === undefined ? undefined : groupeParEtat.get(cible)
      const cibleId = cibleGroupe === undefined ? undefined : idParGroupe.get(cibleGroupe)
      return cibleId === undefined ? [] : [{ de: etat.id, symbole, vers: cibleId }]
    })
  })
  const finauxMinimaux = etatsMinimaux.filter((etat) =>
    (partition[ordreGroupes[etat.id] ?? -1] ?? []).some((id) => afdComplet.finaux.includes(id)),
  ).map((etat) => etat.id)

  return {
    afdMinimal: creerAutomate('AFD minimal', afdComplet.alphabet, etatsMinimaux, 0, finauxMinimaux, transitionsMinimales),
    partitions: historique,
    correspondance,
  }
}