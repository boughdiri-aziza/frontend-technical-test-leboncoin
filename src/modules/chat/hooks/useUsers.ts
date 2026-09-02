import { useState, useEffect } from 'react'
import { User } from '../types'
import { chatApiClient } from '../api/chat-client'

interface UseUsersState {
  users: User[]
  loading: boolean
  error: Error | null
}

/**
 * Users rarely change during a session, so they are fetched once per mount of
 * the consumer rather than on every dialog open.
 */
export const useUsers = (enabled = true) => {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    loading: enabled,
    error: null,
  })

  useEffect(() => {
    if (!enabled) return

    let isMounted = true

    const fetchUsers = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const data = await chatApiClient.getUsers()
        if (isMounted) {
          setState({ users: data, loading: false, error: null })
        }
      } catch (err) {
        if (isMounted) {
          setState({
            users: [],
            loading: false,
            error: err instanceof Error ? err : new Error('Failed to fetch users'),
          })
        }
      }
    }

    fetchUsers()

    return () => {
      isMounted = false
    }
  }, [enabled])

  return state
}
