import { element } from '../utils/dom'

export type TypeMessage = 'succes' | 'erreur' | 'attention' | 'info'

const icones: Record<TypeMessage, string> = {
  succes: '✓',
  erreur: '!',
  attention: '⚠',
  info: 'i',
}

export function creerMessage(type: TypeMessage, texte: string): HTMLDivElement {
  const message = element('div', {
    classe: `message message-${type}`,
    attributs: { role: type === 'erreur' ? 'alert' : 'status' },
  })
  const icone = element('span', { classe: 'message-icone', texte: icones[type], attributs: { 'aria-hidden': 'true' } })
  const contenu = element('span', { texte })
  message.append(icone, contenu)
  return message
}