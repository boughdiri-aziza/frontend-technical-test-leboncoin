# Security Hardening Guide

This document outlines the security measures implemented to protect against common web vulnerabilities for a million-user scale application.

## Input Validation

All user input is validated before being sent to the API.

### Message Validation
```typescript
import { validateMessage } from '@/modules/core'

const result = validateMessage(userInput)
if (!result.valid) {
  console.error(result.error) // "Message exceeds 5000 character limit"
}
```

**Rules:**
- Non-empty (trimmed)
- Maximum 5000 characters
- No special validation needed (sanitization handles XSS)

### Email Validation
```typescript
const result = validateEmail(email)
if (!result.valid) {
  console.error(result.error) // "Invalid email format"
}
```

## Output Sanitization

All user-generated content is sanitized before rendering. Uses **DOMPurify** library for defense-in-depth XSS prevention.

### Text Sanitization
```typescript
import { sanitizeText } from '@/modules/core'

const safeText = sanitizeText(userMessage)
return <div>{safeText}</div> // XSS-safe
```

**Protection:**
- Removes script tags and event handlers
- Strips dangerous attributes (onclick, onerror, etc.)
- Escapes HTML entities
- Works server-side (Node.js) and client-side

### HTML Sanitization
```typescript
import { sanitizeHtmlContent } from '@/modules/core'

const safeHtml = sanitizeHtmlContent(userHtml)
return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
```

**Allowed tags:** `<b>`, `<i>`, `<em>`, `<strong>`, `<br>`, `<p>`  
**Allowed attributes:** None (prevents attribute-based XSS)

### HTML Escaping
```typescript
import { escapeHtml } from '@/modules/core'

const escaped = escapeHtml(untrustedString)
```

Converts: `<`, `>`, `&`, `"`, `'` to HTML entities

## Rate Limiting

**Client-side:** Prevents rapid-fire requests  
**Server-side:** API enforces per-user/IP limits with `Retry-After` header

### Client-Side Rate Limiting

```typescript
import { useRateLimit } from '@/modules/shared'

const rateLimit = useRateLimit({ maxRequests: 5, windowMs: 60000 })

if (!rateLimit.canMakeRequest()) {
  const waitMs = rateLimit.getRetryAfterMs()
  throw new Error(`Please wait ${waitMs / 1000}s before retrying`)
}

rateLimit.recordRequest() // After sending
```

**Features:**
- Sliding window (5 requests per 60 seconds)
- Exponential backoff on repeated failures
- Tracks failure count for exponential delays

### Server-Side Rate Limiting Detection

API client automatically detects 429 (Too Many Requests) responses:

```typescript
try {
  await apiClient.post('/messages/123', body)
} catch (error) {
  if (error.isRateLimit) {
    const waitMs = error.retryAfter // From Retry-After header
    console.error(`Wait ${waitMs / 1000}s before retrying`)
  }
}
```

**Server sends:**
- `429 Too Many Requests` status
- `Retry-After` header (seconds or HTTP-date format)

## API Error Handling

### Error Structure
```typescript
interface ApiError extends Error {
  status: number           // HTTP status code
  retryAfter?: number      // Wait time in milliseconds
  isRateLimit?: boolean    // True if 429 response
}
```

### Error Messages

| Status | Message |
|--------|---------|
| 400 | Invalid request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 429 | Too many requests. Please wait... |
| 500 | Server error. Please try again later. |
| 503 | Service temporarily unavailable |

### Network Error Handling

```typescript
try {
  await apiClient.get('/conversations/123')
} catch (error) {
  if (error.message.includes('timeout')) {
    // Timeout after 30 seconds
  } else if (error.message.includes('Network')) {
    // Connection failed, user offline
  }
}
```

**Timeout:** 30 seconds per request

## Type Guards

All API responses are validated at runtime using type guards:

```typescript
import { isMessage, isConversation, isMessageArray } from '@/modules/chat'

const data = await apiClient.get('/messages/123')

if (!isMessageArray(data)) {
  throw new Error('Invalid API response format')
}

// TypeScript now knows data is Message[]
```

**Benefits:**
- Catches API schema mismatches
- Prevents type coercion attacks
- Validates nested objects

## CSRF Protection

API client includes `Content-Type: application/json` header on all requests. This prevents simple CSRF attacks (JSON not valid in form submissions).

For production: Add CSRF token to POST/PUT/PATCH requests if backend requires:

```typescript
const token = document.querySelector('meta[name="csrf-token"]')?.content
headers: {
  'X-CSRF-Token': token,
}
```

## Content Security Policy

Add to `next.config.js`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' http://localhost:3005",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
```

## Input Injection Prevention

### Message Body (User Input)
1. **Validation:** Length check (5000 chars max)
2. **Sanitization:** DOMPurify removes dangerous patterns
3. **React escaping:** All `{text}` content is escaped by default
4. **Type guards:** API response validated

### URLs and Query Parameters
- Never construct URLs from untrusted input
- Use URL constructor for parsing
- Validate conversationId is a number

```typescript
// ✗ Dangerous
const url = `/messages/${conversationId}` // Could be SQL injection via API

// ✓ Safe
if (!Number.isInteger(conversationId)) throw new Error('Invalid ID')
const url = `/messages/${conversationId}`
```

### JSON Parsing
- Never use `eval()` or `Function()`
- Always use `JSON.parse()`
- Validate structure with type guards

## Privacy & Data Protection

### Sensitive Data in Logs
Never log:
- User passwords or tokens
- Full message content
- Personal identifiable information

```typescript
// ✗ Bad
console.error('Failed to fetch:', response.data)

// ✓ Good
console.error('Failed to fetch messages for conversation:', conversationId)
```

### LocalStorage Usage
If caching to localStorage, encrypt sensitive data:

```typescript
import crypto from 'crypto'

const encrypt = (data: string) => btoa(data) // Base64 only
const decrypt = (encoded: string) => atob(encoded)
```

### Session Management
- Store auth tokens in httpOnly cookies (backend sets)
- Include token in `Authorization` header for API requests
- Clear token on logout
- Validate token expiry

## Testing Security

### Unit Tests
```typescript
describe('Security', () => {
  it('should sanitize XSS payloads', () => {
    const xss = '<script>alert("xss")</script>'
    const result = sanitizeText(xss)
    expect(result).not.toContain('<script>')
  })

  it('should reject messages over 5000 chars', () => {
    const long = 'x'.repeat(5001)
    const result = validateMessage(long)
    expect(result.valid).toBe(false)
  })

  it('should enforce rate limits', () => {
    const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 })
    
    limiter.recordRequest()
    limiter.recordRequest()
    limiter.recordRequest()
    
    expect(limiter.canMakeRequest()).toBe(false)
  })
})
```

## Security Checklist for Deployment

- [ ] HTTPS enabled (no HTTP)
- [ ] CSP headers configured
- [ ] CORS whitelist limited to known origins
- [ ] API enforces rate limits server-side
- [ ] Database uses parameterized queries
- [ ] Secrets in environment variables (not code)
- [ ] Auth tokens in httpOnly cookies
- [ ] HSTS header set (force HTTPS)
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY or SAMEORIGIN
- [ ] Regular security audit and dependency updates

## References

- **OWASP Top 10:** https://owasp.org/Top10/
- **DOMPurify:** https://github.com/cure53/DOMPurify
- **Web Fundamentals Security:** https://web.dev/security/
