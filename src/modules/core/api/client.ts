export interface ApiError extends Error {
  status: number
  retryAfter?: number
  isRateLimit?: boolean
}

export class ApiClient {
  private baseUrl: string = '/api'
  private timeout: number = 30000

  async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw this.createError(response)
      }

      return (await this.parseBody(response)) as T
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && 'status' in error) {
        throw error
      }
      throw this.handleNetworkError(error)
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async patch<T>(endpoint: string, body: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' })
  }

  private async parseBody(response: Response): Promise<unknown> {
    if (response.status === 204) {
      return null
    }

    const text = await response.text()
    if (!text) {
      return null
    }

    try {
      return JSON.parse(text)
    } catch {
      throw new Error('Server returned a malformed response')
    }
  }

  private createError(response: Response): ApiError {
    const error = new Error(this.getErrorMessage(response.status)) as ApiError
    error.status = response.status

    if (response.status === 429) {
      error.isRateLimit = true
      const retryAfter = response.headers.get('Retry-After')
      if (retryAfter) {
        error.retryAfter = this.parseRetryAfter(retryAfter)
      } else {
        error.retryAfter = 60000
      }
    }

    return error
  }

  private parseRetryAfter(header: string): number {
    const seconds = parseInt(header, 10)
    if (!isNaN(seconds)) {
      return Math.max(seconds * 1000, 1000)
    }

    const retryDate = new Date(header).getTime()
    if (!isNaN(retryDate)) {
      const delay = retryDate - Date.now()
      return Math.max(delay, 1000)
    }

    return 60000
  }

  private getErrorMessage(status: number): string {
    const statusMessages: Record<number, string> = {
      400: 'Invalid request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not found',
      429: 'Too many requests. Please wait before retrying.',
      500: 'Server error. Please try again later.',
      503: 'Service temporarily unavailable',
    }

    return statusMessages[status] || `HTTP ${status} Error`
  }

  private handleNetworkError(error: unknown): Error {
    if (error instanceof TypeError) {
      return new Error('Network request failed. Please check your connection.')
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      return new Error('Request timeout. The server took too long to respond.')
    }
    return new Error('An unexpected error occurred')
  }
}

export const apiClient = new ApiClient()
