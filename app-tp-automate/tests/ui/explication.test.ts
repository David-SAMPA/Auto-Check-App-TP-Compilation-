import { describe, expect, it } from 'vitest'
import { expliquerRefus } from '../../src/ui/utils/format'
import type { Automate } from '../../src/model/types'

const automate: Automate = {
  type: 'AFD complet',
  alphabet: ['a', 'b'],
  etats: [
    { id: 0, nom: 'A' },
    { id: 1, nom: 'B' },
  ],
  initial: 0,
  finaux: [0],
  transitions: [
    { de: 0, symbole: 'a', vers: 1 },
    { de: 0, symbole: 'b', vers: 0 },
    { de: 1, symbole: 'a', vers: 1 },
    { de: 1, symbole: 'b', vers: 0 },
  ],
}

describe('explication d’un mot refusé', () => {
  it('explique que l’état d’arrivée n’est pas final et nomme les états acceptants', () => {
    expect(expliquerRefus(automate, 1)).toBe(
      'Le mot a été lu jusqu’au bout, mais il se termine dans l’état « B ». Cet état n’est pas un état d’acceptation. Pour être accepté, le mot devait se terminer dans : A.',
    )
  })
})
