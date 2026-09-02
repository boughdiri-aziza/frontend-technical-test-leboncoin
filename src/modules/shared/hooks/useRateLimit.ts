import { useRef, useCallback, useState } from 'react'
import { RateLimiter, RateLimitConfig, DEFAULT_RATE_LIMIT } from '@/modules/core/security'

interface RateLimitState {
  isLimited: boolean
  retryAfterMs: number
  failureCount: number
}

export const useRateLimit = (config?: Partial<RateLimitConfig>) => {
  const limiterRef = useRef(
    new RateLimiter({
      ...DEFAULT_RATE_LIMIT,
      ...config,
    })
  )

  const [state, setState] = useState<RateLimitState>({
    isLimited: false,
    retryAfterMs: 0,
    failureCount: 0,
  })

  const canMakeRequest = useCallback(() => {
    return limiterRef.current.canMakeRequest()
  }, [])

  const recordRequest = useCallback(() => {
    limiterRef.current.recordRequest()
  }, [])

  const recordSuccess = useCallback(() => {
    limiterRef.current.recordSuccess()
    setState({
      isLimited: false,
      retryAfterMs: 0,
      failureCount: 0,
    })
  }, [])

  const recordFailure = useCallback((retryAfterMs?: number) => {
    limiterRef.current.recordFailure()
    const retryMs = retryAfterMs || limiterRef.current.getRetryAfterMs()

    setState({
      isLimited: true,
      retryAfterMs: retryMs,
      failureCount: limiterRef.current.getExponentialBackoffMs() / 1000,
    })
  }, [])

  const getRetryAfterMs = useCallback(() => {
    return limiterRef.current.getRetryAfterMs()
  }, [])

  const getExponentialBackoffMs = useCallback(() => {
    return limiterRef.current.getExponentialBackoffMs()
  }, [])

  const isRateLimited = useCallback(() => {
    return limiterRef.current.isRateLimited()
  }, [])

  const reset = useCallback(() => {
    limiterRef.current.reset()
    setState({
      isLimited: false,
      retryAfterMs: 0,
      failureCount: 0,
    })
  }, [])

  return {
    canMakeRequest,
    recordRequest,
    recordSuccess,
    recordFailure,
    getRetryAfterMs,
    getExponentialBackoffMs,
    isRateLimited,
    reset,
    state,
  }
}
