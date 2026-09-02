import {
  validateMessage,
  validateConversationId,
  validateUserId,
  validateEmail,
} from '../validation'

describe('validateMessage', () => {
  it('rejects an empty string', () => {
    expect(validateMessage('')).toEqual({
      valid: false,
      error: 'Message cannot be empty',
    })
  })

  it('rejects a string containing only whitespace', () => {
    const result = validateMessage('   \n\t  ')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Message cannot be empty')
  })

  it('accepts a normal message', () => {
    expect(validateMessage('Hello there')).toEqual({ valid: true })
  })

  it('accepts a message exactly at the 5000 character limit', () => {
    const message = 'a'.repeat(5000)
    expect(validateMessage(message)).toEqual({ valid: true })
  })

  it('rejects a message over the 5000 character limit', () => {
    const message = 'a'.repeat(5001)
    const result = validateMessage(message)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Message exceeds 5000 character limit')
  })

  it('trims surrounding whitespace before validating length', () => {
    const message = `  ${'a'.repeat(5000)}  `
    expect(validateMessage(message)).toEqual({ valid: true })
  })
})

describe('validateConversationId', () => {
  it('accepts a positive number', () => {
    expect(validateConversationId(1)).toBe(true)
  })

  it('rejects zero', () => {
    expect(validateConversationId(0)).toBe(false)
  })

  it('rejects a negative number', () => {
    expect(validateConversationId(-5)).toBe(false)
  })

  it('rejects non-number types', () => {
    expect(validateConversationId('1')).toBe(false)
    expect(validateConversationId(null)).toBe(false)
    expect(validateConversationId(undefined)).toBe(false)
  })
})

describe('validateUserId', () => {
  it('accepts a positive number', () => {
    expect(validateUserId(42)).toBe(true)
  })

  it('rejects zero or negative numbers', () => {
    expect(validateUserId(0)).toBe(false)
    expect(validateUserId(-1)).toBe(false)
  })

  it('rejects non-number types', () => {
    expect(validateUserId('42')).toBe(false)
  })
})

describe('validateEmail', () => {
  it('rejects an empty email', () => {
    expect(validateEmail('')).toEqual({
      valid: false,
      error: 'Email is required',
    })
  })

  it('rejects a malformed email', () => {
    const result = validateEmail('not-an-email')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invalid email format')
  })

  it('accepts a well-formed email', () => {
    expect(validateEmail('jane.doe@example.com')).toEqual({ valid: true })
  })

  it('trims whitespace before validating', () => {
    expect(validateEmail('  jane.doe@example.com  ')).toEqual({ valid: true })
  })
})
