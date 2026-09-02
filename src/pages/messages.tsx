import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import {
  useConversations,
  useMessages,
  useUsers,
  chatApiClient,
  Message,
  User,
} from '@/modules/chat'
import {
  ConversationList,
  ConversationPanel,
  NewConversationDialog,
} from '@/modules/chat/components'
import { getCounterpart, isConversationWith } from '@/modules/chat/utils'
import { Toast } from '@/modules/shared'
import { ErrorBoundary } from '@/modules/core'
import { getLoggedUserId } from '@/utils/getLoggedUserId'
import styles from './messages.module.css'

export default function MessagesPage() {
  const router = useRouter()
  const userId = getLoggedUserId()
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const [messagesList, setMessagesList] = useState<Message[]>([])
  const [toastMessage, setToastMessage] = useState<string>('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingConversationId, setDeletingConversationId] = useState<number | null>(null)
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null)

  const conversationsState = useConversations(userId)
  const messagesState = useMessages(selectedConversationId)
  const usersState = useUsers()
  const { conversations, refetch, removeConversation } = conversationsState

  const currentUser = useMemo(
    () => usersState.users.find((u) => u.id === userId),
    [usersState.users, userId]
  )

  useEffect(() => {
    if (router.query.conversationId) {
      const id = Number(router.query.conversationId)
      if (!isNaN(id)) {
        setSelectedConversationId(id)
      }
    }
  }, [router.query.conversationId])

  useEffect(() => {
    setMessagesList(messagesState.messages)
  }, [messagesState.messages])

  const notify = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToastMessage(message)
    setToastType(type)
  }, [])

  const selectConversation = useCallback(
    (id: number | null) => {
      setSelectedConversationId(id)
      router.push(
        { pathname: '/messages', query: id ? { conversationId: id } : {} },
        undefined,
        { shallow: true }
      )
    },
    [router]
  )

  const handleSelectUser = useCallback(
    async (user: User) => {
      setIsDialogOpen(false)

      const existing = conversations.find((c) => isConversationWith(c, userId, user.id))
      if (existing) {
        selectConversation(existing.id)
        notify(`Opened your conversation with ${user.nickname}`, 'info')
        return
      }

      if (!currentUser) {
        notify('Your profile is still loading, try again in a moment', 'error')
        return
      }

      try {
        const { id } = await chatApiClient.createConversation(currentUser, user)
        await refetch(true)
        selectConversation(id)
        notify(`Conversation with ${user.nickname} created`, 'success')
      } catch (err) {
        notify(err instanceof Error ? err.message : 'Failed to create conversation', 'error')
      }
    },
    [conversations, userId, currentUser, selectConversation, notify, refetch]
  )

  const handleDeleteConversation = useCallback(
    async (conversationId: number) => {
      const target = conversations.find((c) => c.id === conversationId)
      const label = target
        ? `conversation with ${getCounterpart(target, userId).nickname}`
        : 'this conversation'

      if (!window.confirm(`Delete the ${label}? This cannot be undone.`)) {
        return
      }

      setDeletingConversationId(conversationId)

      try {
        await chatApiClient.deleteConversation(conversationId)
        removeConversation(conversationId)

        if (selectedConversationId === conversationId) {
          selectConversation(null)
        }

        notify('Conversation deleted', 'success')
      } catch (err) {
        notify(err instanceof Error ? err.message : 'Failed to delete conversation', 'error')
      } finally {
        setDeletingConversationId(null)
      }
    },
    [conversations, userId, removeConversation, selectedConversationId, selectConversation, notify]
  )

  const handleDeleteMessage = useCallback(
    async (messageId: number) => {
      setDeletingMessageId(messageId)

      try {
        await chatApiClient.deleteMessage(messageId)
        setMessagesList((prev) => prev.filter((m) => m.id !== messageId))
        notify('Message deleted', 'success')
      } catch (err) {
        notify(err instanceof Error ? err.message : 'Failed to delete message', 'error')
      } finally {
        setDeletingMessageId(null)
      }
    },
    [notify]
  )

  const handleMessageSent = useCallback(
    (newMessage: Message) => {
      setMessagesList((prev) => [...prev, newMessage])
      refetch(true)
    },
    [refetch]
  )

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  const existingRecipientIds = useMemo(
    () => conversations.map((c) => getCounterpart(c, userId).id),
    [conversations, userId]
  )

  return (
    <ErrorBoundary>
      <main className={styles.container}>
        <div className={styles.layout} data-view={selectedConversationId ? 'panel' : 'list'}>
          <div className={styles.sidebar}>
            <ConversationList
              conversations={conversations}
              currentUserId={userId}
              selectedId={selectedConversationId}
              onSelect={selectConversation}
              onNewConversation={() => setIsDialogOpen(true)}
              onDelete={handleDeleteConversation}
              deletingId={deletingConversationId}
              loading={conversationsState.loading}
              error={conversationsState.error ? conversationsState.error.message : undefined}
            />
          </div>

          <div className={styles.panel}>
            <ConversationPanel
              conversation={selectedConversation || null}
              messages={messagesList}
              currentUserId={userId}
              loading={messagesState.loading}
              error={messagesState.error ? messagesState.error.message : undefined}
              onMessageSent={handleMessageSent}
              onBack={() => selectConversation(null)}
              onDeleteMessage={handleDeleteMessage}
              deletingMessageId={deletingMessageId}
            />
          </div>
        </div>

        <NewConversationDialog
          open={isDialogOpen}
          currentUserId={userId}
          users={usersState.users}
          loading={usersState.loading}
          error={usersState.error ? usersState.error.message : undefined}
          existingRecipientIds={existingRecipientIds}
          onSelect={handleSelectUser}
          onClose={() => setIsDialogOpen(false)}
        />

        {toastMessage && (
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        )}
      </main>
    </ErrorBoundary>
  )
}
