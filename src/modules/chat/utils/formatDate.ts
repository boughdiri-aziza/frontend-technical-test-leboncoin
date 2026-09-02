export const formatMessageTime = (timestamp: number | string): string => {
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return '--:--'

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '--:--'
  }
}

export const formatConversationDate = (timestamp: number | string): string => {
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return 'Unknown'

    const now = new Date()
    const isCurrentYear = date.getFullYear() === now.getFullYear()

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: isCurrentYear ? undefined : 'numeric',
    })
  } catch {
    return 'Unknown'
  }
}

export const formatFullDateTime = (timestamp: number | string): string => {
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return 'Unknown'

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Unknown'
  }
}
