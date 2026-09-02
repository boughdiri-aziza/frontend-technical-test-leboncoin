import React, { useMemo } from 'react'
import { Conversation } from '../../types'
import { ConversationListItem } from '../ConversationListItem'
import styles from './ConversationList.module.css'

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: number
  selectedId: number | null
  onSelect: (id: number) => void
  onNewConversation?: () => void
  onDelete?: (id: number) => void
  deletingId?: number | null
  loading?: boolean
  error?: string
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUserId,
  selectedId,
  onSelect,
  onNewConversation,
  onDelete,
  deletingId,
  loading,
  error,
}) => {
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)
  }, [conversations])

  const renderBody = () => {
    if (error) {
      return (
        <div className={styles.error} role="alert">
          <p>{error}</p>
        </div>
      )
    }

    if (loading) {
      return (
        <div className={styles.skeletonList}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.skeletonItem} />
          ))}
        </div>
      )
    }

    if (sortedConversations.length === 0) {
      return (
        <div className={styles.empty}>
          <p>No conversations yet</p>
        </div>
      )
    }

    return (
      <ul className={styles.list} role="list">
        {sortedConversations.map((conversation) => (
          <li key={conversation.id}>
            <ConversationListItem
              conversation={conversation}
              currentUserId={currentUserId}
              isSelected={selectedId === conversation.id}
              onClick={() => onSelect(conversation.id)}
              onDelete={onDelete ? () => onDelete(conversation.id) : undefined}
              deleting={deletingId === conversation.id}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <aside className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Messages</h1>
        {onNewConversation && (
          <button
            className={styles.newButton}
            onClick={onNewConversation}
            aria-label="Start a new conversation"
          >
            New
          </button>
        )}
      </header>

      {renderBody()}
    </aside>
  )
}
