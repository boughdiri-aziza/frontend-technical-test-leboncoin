import React, { useCallback } from 'react'
import { Conversation, Message } from '../../types'
import { getCounterpart } from '../../utils'
import { chatApiClient } from '../../api'
import { MessageList } from '../MessageList'
import { MessageInput } from '../MessageInput'
import styles from './ConversationPanel.module.css'

interface ConversationPanelProps {
  conversation: Conversation | null
  messages: Message[]
  currentUserId: number
  loading?: boolean
  error?: string
  onMessageSent?: (message: Message) => void
  onBack?: () => void
  onDeleteMessage?: (messageId: number) => void
  deletingMessageId?: number | null
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  conversation,
  messages,
  currentUserId,
  loading,
  error,
  onMessageSent,
  onBack,
  onDeleteMessage,
  deletingMessageId,
}) => {
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!conversation) throw new Error('No conversation selected')

      const timestamp = Date.now()
      const response = await chatApiClient.sendMessage(conversation.id, {
        body: text,
        timestamp,
        authorId: currentUserId,
      })

      const newMessage: Message = {
        id: response.id,
        conversationId: conversation.id,
        authorId: currentUserId,
        timestamp,
        body: text,
      }

      onMessageSent?.(newMessage)
    },
    [conversation, currentUserId, onMessageSent]
  )

  if (!conversation) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    )
  }

  const other = getCounterpart(conversation, currentUserId)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {onBack && (
          <button className={styles.back} onClick={onBack} aria-label="Back to conversations">
            ←
          </button>
        )}
        <span className={styles.avatar} aria-hidden="true">
          {other.nickname.charAt(0)}
        </span>
        <h2 className={styles.title}>{other.nickname}</h2>
      </div>

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        loading={loading}
        error={error}
        onDeleteMessage={onDeleteMessage}
        deletingMessageId={deletingMessageId}
      />

      <MessageInput onSend={handleSendMessage} />
    </div>
  )
}
