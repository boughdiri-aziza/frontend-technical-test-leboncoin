import React from 'react'
import { Conversation } from '../../types'
import { formatConversationDate, getCounterpart } from '../../utils'
import styles from './ConversationListItem.module.css'

interface ConversationListItemProps {
  conversation: Conversation
  currentUserId: number
  isSelected: boolean
  onClick: () => void
  onDelete?: () => void
  deleting?: boolean
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  currentUserId,
  isSelected,
  onClick,
  onDelete,
  deleting,
}) => {
  const formattedDate = formatConversationDate(conversation.lastMessageTimestamp)
  const other = getCounterpart(conversation, currentUserId)

  return (
    <div className={`${styles.row} ${isSelected ? styles.selected : ''}`}>
      <button
        className={styles.item}
        onClick={onClick}
        aria-pressed={isSelected}
        aria-label={`Conversation with ${other.nickname}`}
      >
        <span className={styles.avatar} aria-hidden="true">
          {other.nickname.charAt(0)}
        </span>
        <span className={styles.content}>
          <span className={styles.nickname}>{other.nickname}</span>
          <span className={styles.date}>{formattedDate}</span>
        </span>
      </button>

      {onDelete && (
        <button
          className={styles.delete}
          onClick={onDelete}
          disabled={deleting}
          aria-label={`Delete conversation with ${other.nickname}`}
          title="Delete conversation"
        >
          {deleting ? '…' : '🗑'}
        </button>
      )}
    </div>
  )
}
