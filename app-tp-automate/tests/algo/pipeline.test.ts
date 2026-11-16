import { estComplet } from '../../src/model/automate'
import { construireTout } from '../../src/algo/pipeline'
import { verdict } from '../../src/algo/reconnaissance/verdict'
import { formaterConfigurations } from '../../src/algo/reconnaissance/configurations'

function normaliserPartitions(partitions: string[][][]): string[][][] {
  return partitions.map((partition) => partition
    .map((groupe) => [...groupe].sort())
    .sort((gauche, droite) => gauche.join(',').localeCompare(droite.join(','))))
}

describe('pipeline du cas du cours', () => {
  const resultat = construireTout('a, b', '(a|b)*abb')

  it('construit l’AFN, l’AFD et le minimal attendus', () => {
    expect(resultat.ok).toBe(true)
    if (!resultat.ok) return
    expect(resultat.postfixe).toBe('ab|*a.b.b.')
    expect(resultat.resume).toEqual({ etatsAfn: 11, etatsAfd: 5, etatsAfdComplet: 5, etatsMinimal: 4 })
    expect(resultat.afnEpsilon.etats.map((etat) => etat.id)).toEqual([...Array(11).keys()])
    expect(resultat.afnEpsilon.transitions).toHaveLength(13)
    expect(resultat.afnEpsilon.transitions).toEqual(expect.arrayContaining([
      { de: 0, symbole: 'ε', vers: 1 }, { de: 0, symbole: 'ε', vers: 7 },
      { de: 1, symbole: 'ε', vers: 2 }, { de: 1, symbole: 'ε', vers: 4 },
      { de: 2, symbole: 'a', vers: 3 }, { de: 4, symbole: 'b', vers: 5 },
      { de: 3, symbole: 'ε', vers: 6 }, { de: 5, symbole: 'ε', vers: 6 },
      { de: 6, symbole: 'ε', vers: 1 }, { de: 6, symbole: 'ε', vers: 7 },
      { de: 7, symbole: 'a', vers: 8 }, { de: 8, symbole: 'b', vers: 9 },
      { de: 9, symbole: 'b', vers: 10 },
    ]))
    expect(resultat.afnEpsilon.initial).toBe(0)
    expect(resultat.afnEpsilon.finaux).toEqual([10])
    expect(resultat.etapesDtran.map((etape) => etape.nom)).toEqual(['A', 'B', 'C', 'D', 'E'])
    expect(resultat.etapesDtran.map((etape) => etape.contenu)).toEqual([
      [0, 1, 2, 4, 7], [1, 2, 3, 4, 6, 7, 8], [1, 2, 4, 5, 6, 7],
      [1, 2, 4, 5, 6, 7, 9], [1, 2, 4, 5, 6, 7, 10],
    ])
    expect(resultat.partitions).toHaveLength(4)
    expect(normaliserPartitions(resultat.partitions)).toEqual(normaliserPartitions([
        [['E'], ['A', 'B', 'C', 'D']],
        [['A', 'B', 'C'], ['D'], ['E']],
        [['A', 'C'], ['B'], ['D'], ['E']],
        [['A', 'C'], ['B'], ['D'], ['E']],
      ]))
    expect(resultat.afdMinimal.etats.map((etat) => [etat.nom, etat.contenu])).toEqual([
      ['q0', ['A', 'C']], ['q1', ['B']], ['q2', ['D']], ['q3', ['E']],
    ])
    expect(resultat.afdMinimal.transitions).toEqual(expect.arrayContaining([
      { de: 0, symbole: 'a', vers: 1 }, { de: 0, symbole: 'b', vers: 0 },
      { de: 1, symbole: 'a', vers: 1 }, { de: 1, symbole: 'b', vers: 2 },
      { de: 2, symbole: 'a', vers: 1 }, { de: 2, symbole: 'b', vers: 3 },
      { de: 3, symbole: 'a', vers: 1 }, { de: 3, symbole: 'b', vers: 0 },
    ]))
    expect(estComplet(resultat.afdComplet)).toBe(true)
  })

  it.each([
    ['abb', true], ['aabb', true], ['babb', true], ['ababb', true],
    ['ab', false], ['abba', false], ['', false],
  ])('reconnaît %j avec trois méthodes concordantes', (mot, attendu) => {
    if (!resultat.ok) throw new Error('Pipeline invalide')
    const resultatMot = verdict(resultat.afdComplet, mot)
    expect(resultatMot).toMatchObject({ accepte: attendu, concordance: true })
    if (mot === 'aabb' && !('erreur' in resultatMot)) {
      expect(formaterConfigurations(resultatMot.configurations, resultat.afdComplet, resultat.correspondance))
        .toBe('(q0, aabb) ⊢ (q1, abb) ⊢ (q1, bb) ⊢ (q2, b) ⊢ (q3, ε)')
    }
  })
})

describe('autres langages de référence', () => {
  it.each([
    ['a*b', ['a', 'b'], ['b', 'aab'], ['a', 'ba']],
    ['(ab)*', ['a', 'b'], ['', 'ab', 'abab'], ['a', 'aba', 'ba']],
    ['a+b?', ['a', 'b'], ['a', 'aaa', 'ab', 'aab'], ['b', 'abb']],
    ['(0|1)*1', ['0', '1'], ['1', '01', '101'], ['', '10']],
    ['a(ab|a)*b', ['a', 'b'], ['ab', 'aab', 'aaab', 'aabb'], ['a', 'b', 'abb']],
    ['a*bc+', ['a', 'b', 'c'], ['bc', 'abcc', 'aabc'], ['b', 'ac', 'bcb']],
    ['a(b|c)*', ['a', 'b', 'c'], ['a', 'abcb', 'ac'], ['ba', 'aa']],
    ['ab', ['a', 'b'], ['ab'], ['a', 'b', 'abb', 'ba']],
  ])('conserve le langage de %s', (expression, alphabet, acceptes, refuses) => {
    const resultat = construireTout(alphabet.join(', '), expression)
    expect(resultat.ok).toBe(true)
    if (!resultat.ok) return
    for (const mot of acceptes) expect(verdict(resultat.afdComplet, mot)).toMatchObject({ accepte: true, concordance: true })
    for (const mot of refuses) expect(verdict(resultat.afdComplet, mot)).toMatchObject({ accepte: false, concordance: true })
  })
})

describe('propriétés de complétion et de minimisation', () => {
  it('ajoute un puits pour l’expression ab', () => {
    const resultat = construireTout('a, b', 'ab')
    expect(resultat.ok).toBe(true)
    if (!resultat.ok) return
    expect(resultat.puitsAjoute).toBe(true)
    expect(estComplet(resultat.afdComplet)).toBe(true)
    expect(resultat.afdComplet.etats.some((etat) => etat.nom === 'p' && etat.estPuits)).toBe(true)
  })

  it.each([
    ['(a|b)*abb', 4], ['(ab)*', 3], ['a*b', 3], ['ab*', 3], ['(0|1)*1', 2], ['ab', 4],
  ])('minimise %s à %i états', (expression, nombre) => {
    const alphabet = expression.includes('0') ? '0, 1' : 'a, b'
    const resultat = construireTout(alphabet, expression)
    expect(resultat.ok && resultat.resume.etatsMinimal).toBe(nombre)
  })

  it('traite ε sur a* et rejette les symboles hors alphabet', () => {
    const resultat = construireTout('a, b', 'a*')
    expect(resultat.ok).toBe(true)
    if (!resultat.ok) return
    expect(resultat.afdComplet.finaux).toContain(resultat.afdComplet.initial)
    expect(verdict(resultat.afdComplet, '')).toMatchObject({ accepte: true, concordance: true })
    expect(verdict(resultat.afdComplet, 'aaa')).toMatchObject({ accepte: true, concordance: true })
    expect(verdict(resultat.afdComplet, 'ab')).toMatchObject({ accepte: false, concordance: true })
    expect(verdict(resultat.afdComplet, 'c')).toMatchObject({ erreur: { code: 'MOT_HORS_ALPHABET' } })
  })
})