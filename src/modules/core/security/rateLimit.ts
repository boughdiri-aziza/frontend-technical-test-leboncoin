export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  backoffMultiplier?: number
  maxBackoffMs?: number
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60000,
  backoffMultiplier: 2,
  maxBackoffMs: 300000,
}

export interface RateLimitError extends Error {
  retryAfter: number
  isServerRateLimit: boolean
}

export class RateLimiter {
  private requests: number[] = []
  private maxRequests: number
  private windowMs: number
  private backoffMultiplier: number
  private maxBackoffMs: number
  private failureCount: number = 0
  private lastResetTime: number = Date.now()

  constructor(config: RateLimitConfig) {
    this.maxRequests = config.maxRequests
    this.windowMs = config.windowMs
    this.backoffMultiplier = config.backoffMultiplier || 2
    this.maxBackoffMs = config.maxBackoffMs || 300000
  }

  canMakeRequest(): boolean {
    const now = Date.now()
    const recentRequests = this.requests.filter((timestamp) => now - timestamp < this.windowMs)
    const canProceed = recentRequests.length < this.maxRequests

    if (!canProceed) {
      this.failureCount++
    }

    return canProceed
  }

  recordRequest(): void {
    this.requests.push(Date.now())
    const now = Date.now()
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs)
  }

  recordFailure(): void {
    this.failureCount++
  }

  recordSuccess(): void {
    this.failureCount = 0
    this.lastResetTime = Date.now()
  }

  getRetryAfterMs(): number {
    const now = Date.now()
    const recentRequests = this.requests.filter((timestamp) => now - timestamp < this.windowMs)

    if (recentRequests.length === 0) return 0

    const oldestRequest = recentRequests[0]
    const windowRetry = this.windowMs - (now - oldestRequest)

    const exponentialBackoff = Math.min(
      Math.pow(this.backoffMultiplier, this.failureCount) * 1000,
      this.maxBackoffMs
    )

    return Math.max(windowRetry, exponentialBackoff)
  }

  getExponentialBackoffMs(): number {
    return Math.min(
      Math.pow(this.backoffMultiplier, this.failureCount) * 1000,
      this.maxBackoffMs
    )
  }

  isRateLimited(): boolean {
    return !this.canMakeRequest()
  }

  reset(): void {
    this.requests = []
    this.failureCount = 0
    this.lastResetTime = Date.now()
  }
}

export const parseRetryAfterHeader = (header: string | null): number => {
  if (!header) return 0

  const seconds = parseInt(header, 10)
  if (!isNaN(seconds)) {
    return Math.max(seconds * 1000, 1000)
  }

  const retryDate = new Date(header).getTime()
  if (!isNaN(retryDate)) {
    const delay = retryDate - Date.now()
    return Math.max(delay, 1000)
  }

  return 0
}

export const createRateLimitError = (
  retryAfter: number,
  isServerRateLimit: boolean = false
): RateLimitError => {
  const error = new Error(
    isServerRateLimit
      ? 'Server rate limit exceeded. Please wait before retrying.'
      : 'Too many requests. Please slow down.'
  ) as RateLimitError
  error.retryAfter = retryAfter
  error.isServerRateLimit = isServerRateLimit
  return error
}

export const createRateLimiter = (config?: Partial<RateLimitConfig>): RateLimiter => {
  return new RateLimiter({
    ...DEFAULT_RATE_LIMIT,
    ...config,
  })
}
