import { useState, useEffect, useCallback, useRef } from 'react'
import { Conversation } from '../types'
import { chatApiClient } from '../api/chat-client'

interface UseConversationsState {
  conversations: Conversation[]
  loading: boolean
  error: Error | null
}

export const useConversations = (userId: number) => {
  const [state, setState] = useState<UseConversationsState>({
    conversations: [],
    loading: true,
    error: null,
  })
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setState((prev) => ({ ...prev, loading: true, error: null }))
      }

      try {
        const data = await chatApiClient.getConversations(userId)

        if (isMountedRef.current) {
          setState({ conversations: data, loading: false, error: null })
        }
      } catch (err) {
        if (isMountedRef.current) {
          setState((prev) => ({
            conversations: silent ? prev.conversations : [],
            loading: false,
            error: err instanceof Error ? err : new Error('Failed to fetch conversations'),
          }))
        }
      }
    },
    [userId]
  )

  useEffect(() => {
    load()
  }, [load])

  const removeConversation = useCallback((conversationId: number) => {
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.filter((c) => c.id !== conversationId),
    }))
  }, [])

  return {
    ...state,
    refetch: load,
    removeConversation,
  }
}
