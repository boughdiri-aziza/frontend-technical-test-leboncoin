import DOMPurify from 'isomorphic-dompurify'

const MAX_MESSAGE_LENGTH = 5000

const purifyConfig = {
  ALLOWED_TAGS: [] as string[],
  ALLOWED_ATTR: [] as string[],
  KEEP_CONTENT: true,
}

export const sanitizeMessageInput = (input: string): string => {
  if (typeof input !== 'string') {
    return ''
  }

  const trimmed = input.trim()
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return trimmed.slice(0, MAX_MESSAGE_LENGTH)
  }

  return trimmed
}

export const sanitizeText = (text: string): string => {
  if (typeof text !== 'string') {
    return ''
  }

  const trimmed = text.trim()
  const purified = DOMPurify.sanitize(trimmed, purifyConfig)

  return purified
}

export const sanitizeHtmlContent = (html: string): string => {
  if (typeof html !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  })
}

export const isValidJSON = (json: unknown): json is object => {
  if (typeof json !== 'object' || json === null) {
    return false
  }
  return true
}

export const escapeHtml = (text: string): string => {
  if (typeof text !== 'string') {
    return ''
  }

  const div = typeof document !== 'undefined' ? document.createElement('div') : null
  if (div) {
    div.textContent = text
    return div.innerHTML
  }

  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char])
}
