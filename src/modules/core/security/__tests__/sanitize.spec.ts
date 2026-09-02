import {
  sanitizeMessageInput,
  sanitizeText,
  sanitizeHtmlContent,
  isValidJSON,
  escapeHtml,
} from '../sanitize'

describe('sanitizeMessageInput', () => {
  it('trims surrounding whitespace', () => {
    expect(sanitizeMessageInput('  hello  ')).toBe('hello')
  })

  it('truncates input longer than 5000 characters', () => {
    const input = 'a'.repeat(5010)
    expect(sanitizeMessageInput(input)).toHaveLength(5000)
  })

  it('returns an empty string for non-string input', () => {
    // @ts-expect-error testing runtime guard against unexpected input
    expect(sanitizeMessageInput(null)).toBe('')
    // @ts-expect-error testing runtime guard against unexpected input
    expect(sanitizeMessageInput(undefined)).toBe('')
  })
})

describe('sanitizeText', () => {
  it('strips all HTML tags, keeping the text content', () => {
    expect(sanitizeText('<b>hello</b>')).toBe('hello')
  })

  it('removes script tags entirely, including their content', () => {
    const result = sanitizeText('<script>alert("xss")</script>hello')
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert')
    expect(result).toContain('hello')
  })

  it('strips inline event handler attributes', () => {
    const result = sanitizeText('<img src="x" onerror="alert(1)">')
    expect(result).not.toContain('onerror')
  })
})

describe('sanitizeHtmlContent', () => {
  it('keeps explicitly allowed formatting tags', () => {
    const result = sanitizeHtmlContent('<b>bold</b> and <em>emphasis</em>')
    expect(result).toContain('<b>bold</b>')
    expect(result).toContain('<em>emphasis</em>')
  })

  it('strips tags that are not in the allow-list', () => {
    const result = sanitizeHtmlContent('<script>alert(1)</script><div>text</div>')
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('<div>')
    expect(result).toContain('text')
  })

  it('strips attributes even on allowed tags', () => {
    const result = sanitizeHtmlContent('<b onclick="alert(1)">bold</b>')
    expect(result).not.toContain('onclick')
    expect(result).toContain('<b>bold</b>')
  })
})

describe('isValidJSON', () => {
  it('accepts a plain object', () => {
    expect(isValidJSON({ a: 1 })).toBe(true)
  })

  it('rejects null', () => {
    expect(isValidJSON(null)).toBe(false)
  })

  it('rejects primitive values', () => {
    expect(isValidJSON('string')).toBe(false)
    expect(isValidJSON(42)).toBe(false)
    expect(isValidJSON(true)).toBe(false)
  })
})

describe('escapeHtml', () => {
  it('escapes angle brackets and quotes', () => {
    expect(escapeHtml('<script>"test"</script>')).toBe(
      '&lt;script&gt;"test"&lt;/script&gt;'
    )
  })

  it('returns an empty string for non-string input', () => {
    // @ts-expect-error testing runtime guard against unexpected input
    expect(escapeHtml(null)).toBe('')
  })

  it('leaves plain text untouched', () => {
    expect(escapeHtml('hello world')).toBe('hello world')
  })
})
