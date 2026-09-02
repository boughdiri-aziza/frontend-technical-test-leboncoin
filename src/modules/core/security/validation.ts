export interface ValidationResult {
  valid: boolean
  error?: string
}

export const validateMessage = (text: string): ValidationResult => {
  const trimmed = text.trim()

  if (!trimmed) {
    return { valid: false, error: 'Message cannot be empty' }
  }

  if (trimmed.length > 5000) {
    return { valid: false, error: 'Message exceeds 5000 character limit' }
  }

  return { valid: true }
}

export const validateConversationId = (id: unknown): id is number => {
  return typeof id === 'number' && id > 0
}

export const validateUserId = (id: unknown): id is number => {
  return typeof id === 'number' && id > 0
}

export const validateEmail = (email: string): ValidationResult => {
  const trimmed = email.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!trimmed) {
    return { valid: false, error: 'Email is required' }
  }

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}
