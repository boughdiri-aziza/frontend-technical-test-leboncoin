import React, { useEffect, useMemo, useRef, useState } from 'react'
import { User } from '../../types'
import styles from './NewConversationDialog.module.css'

interface NewConversationDialogProps {
  open: boolean
  currentUserId: number
  users: User[]
  loading?: boolean
  error?: string
  existingRecipientIds: number[]
  onSelect: (user: User) => void
  onClose: () => void
}

export const NewConversationDialog: React.FC<NewConversationDialogProps> = ({
  open,
  currentUserId,
  users,
  loading,
  error,
  existingRecipientIds,
  onSelect,
  onClose,
}) => {
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      searchRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const visibleUsers = useMemo(() => {
    const term = query.trim().toLowerCase()

    return users
      .filter((user) => user.id !== currentUserId)
      .filter((user) => !term || user.nickname.toLowerCase().includes(term))
      .sort((a, b) => a.nickname.localeCompare(b.nickname))
  }, [users, currentUserId, query])

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="New conversation"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>New conversation</h2>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <input
          ref={searchRef}
          className={styles.search}
          type="search"
          placeholder="Search people"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search people"
        />

        <div className={styles.body}>
          {loading && <p className={styles.state}>Loading people…</p>}

          {error && (
            <p className={`${styles.state} ${styles.error}`} role="alert">
              {error}
            </p>
          )}

          {!loading && !error && visibleUsers.length === 0 && (
            <p className={styles.state}>No one matches “{query}”</p>
          )}

          {!loading && !error && visibleUsers.length > 0 && (
            <ul className={styles.list}>
              {visibleUsers.map((user) => (
                <li key={user.id}>
                  <button className={styles.user} onClick={() => onSelect(user)}>
                    <span className={styles.avatar} aria-hidden="true">
                      {user.nickname.charAt(0)}
                    </span>
                    <span className={styles.nickname}>{user.nickname}</span>
                    {existingRecipientIds.includes(user.id) && (
                      <span className={styles.badge}>Existing</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
