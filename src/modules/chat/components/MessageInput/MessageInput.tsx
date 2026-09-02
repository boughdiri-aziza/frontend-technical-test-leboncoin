import React, { useState, useCallback } from 'react'
import { validateMessage, sanitizeMessageInput } from '@/modules/core'
import { useRateLimit } from '@/modules/shared'
import styles from './MessageInput.module.css'

interface MessageInputProps {
  onSend: (message: string) => Promise<void>
  disabled?: boolean
  error?: string
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled, error }) => {
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [validationError, setValidationError] = useState<string>('')
  const rateLimit = useRateLimit({ maxRequests: 5, windowMs: 60000 })

  const charCount = text.length
  const maxChars = 5000
  const isOverLimit = charCount > maxChars
  const isNearLimit = charCount > maxChars * 0.9

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setText(value)

    if (value.trim()) {
      setValidationError('')
    }
  }

  const handleSend = useCallback(async () => {
    setValidationError('')

    const validation = validateMessage(text)
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid message')
      return
    }

    if (!rateLimit.canMakeRequest()) {
      const waitMs = rateLimit.getRetryAfterMs()
      setValidationError(
        `Too many messages. Please wait ${Math.ceil(waitMs / 1000)}s before sending another.`
      )
      return
    }

    try {
      setIsSending(true)
      rateLimit.recordRequest()

      const sanitized = sanitizeMessageInput(text)
      await onSend(sanitized)

      rateLimit.recordSuccess()
      setText('')
      setValidationError('')
    } catch (err) {
      rateLimit.recordFailure(
        err instanceof Error && 'retryAfter' in err ? (err.retryAfter as number) : undefined
      )

      const errorMsg =
        err instanceof Error ? err.message : 'Failed to send message. Please try again.'
      setValidationError(errorMsg)
    } finally {
      setIsSending(false)
    }
  }, [text, onSend, rateLimit])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSend()
    }
  }

  const isDisabled = disabled || isSending || isOverLimit || !text.trim()
  const currentError = error || validationError

  return (
    <div className={styles.container}>
      <div className={styles.composer}>
        {currentError && (
          <div className={styles.errorMessage} role="alert">
            {currentError}
          </div>
        )}

        <div className={styles.row}>
          <textarea
            className={`${styles.input} ${currentError ? styles.error : ''}`}
            placeholder="Type a message... (Ctrl+Enter to send)"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            maxLength={maxChars}
            rows={1}
            aria-label="Message input"
            aria-describedby="message-hints"
          />

          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={isDisabled}
            aria-label="Send message"
          >
            {isSending ? 'Sending…' : 'Send'}
          </button>
        </div>

        <div id="message-hints" className={styles.hints}>
          <span className={`${styles.charCount} ${isNearLimit ? styles.warning : ''}`}>
            {charCount} / {maxChars}
          </span>
        </div>
      </div>
    </div>
  )
}
