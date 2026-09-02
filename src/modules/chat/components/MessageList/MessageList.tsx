import React, { useEffect, useRef } from 'react'
import { Message as MessageType } from '../../types'
import { Message } from '../Message'
import styles from './MessageList.module.css'

interface MessageListProps {
  messages: MessageType[]
  currentUserId: number
  loading?: boolean
  error?: string
  onDeleteMessage?: (messageId: number) => void
  deletingMessageId?: number | null
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  loading,
  error,
  onDeleteMessage,
  deletingMessageId,
}) => {
  const endRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer} role="alert">
          <p className={styles.errorMessage}>{error}</p>
          <p className={styles.errorHint}>Try refreshing the page or selecting another conversation.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonList}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonMessage} />
          ))}
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>No messages yet</p>
          <p className={styles.hint}>Start the conversation by sending a message</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <ul className={styles.list} role="log" aria-live="polite" aria-atomic="false">
        {messages.map((msg) => (
          <li key={msg.id} className={styles.item}>
            <Message
              message={msg}
              isOwn={msg.authorId === currentUserId}
              onDelete={onDeleteMessage ? () => onDeleteMessage(msg.id) : undefined}
              deleting={deletingMessageId === msg.id}
            />
          </li>
        ))}
        <li ref={endRef} aria-hidden="true" />
      </ul>
    </div>
  )
}
