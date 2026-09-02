import React from 'react'
import { Message as MessageType } from '../../types'
import { formatMessageTime } from '../../utils'
import { sanitizeText } from '@/modules/core'
import styles from './Message.module.css'

interface MessageProps {
  message: MessageType
  isOwn: boolean
  onDelete?: () => void
  deleting?: boolean
}

export const Message: React.FC<MessageProps> = ({ message, isOwn, onDelete, deleting }) => {
  const formattedTime = formatMessageTime(message.timestamp)

  return (
    <div
      className={`${styles.message} ${isOwn ? styles.own : styles.other} ${
        deleting ? styles.deleting : ''
      }`}
    >
      <div className={styles.content}>
        <p className={styles.body}>{sanitizeText(message.body)}</p>
        <span className={styles.time}>{formattedTime}</span>
      </div>

      {isOwn && onDelete && (
        <button
          className={styles.delete}
          onClick={onDelete}
          disabled={deleting}
          aria-label="Delete message"
          title="Delete message"
        >
          🗑
        </button>
      )}
    </div>
  )
}
