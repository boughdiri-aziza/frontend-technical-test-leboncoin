import { useState, useEffect } from 'react'
import { Message } from '../types'
import { chatApiClient } from '../api/chat-client'

interface UseMessagesState {
  messages: Message[]
  loading: boolean
  error: Error | null
}

export const useMessages = (conversationId: number | null) => {
  const [state, setState] = useState<UseMessagesState>({
    messages: [],
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (!conversationId) {
      setState({ messages: [], loading: false, error: null })
      return
    }

    let isMounted = true

    const fetchMessages = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))
        const data = await chatApiClient.getMessages(conversationId)

        if (isMounted) {
          setState({
            messages: data,
            loading: false,
            error: null,
          })
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error('Failed to fetch messages')
          setState({
            messages: [],
            loading: false,
            error,
          })
        }
      }
    }

    fetchMessages()

    return () => {
      isMounted = false
    }
  }, [conversationId])

  return state
}
