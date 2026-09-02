import { Conversation } from '../types'

export interface Participant {
  id: number
  nickname: string
}

/**
 * A conversation stores a fixed sender/recipient pair decided by whoever
 * created it, so the logged user can sit on either side. The UI always wants
 * the other person, never the user themselves.
 */
export const getCounterpart = (
  conversation: Conversation,
  currentUserId: number
): Participant => {
  const isSender = conversation.senderId === currentUserId

  return {
    id: isSender ? conversation.recipientId : conversation.senderId,
    nickname: isSender ? conversation.recipientNickname : conversation.senderNickname,
  }
}

export const isConversationWith = (
  conversation: Conversation,
  currentUserId: number,
  otherUserId: number
): boolean => {
  return (
    (conversation.senderId === currentUserId && conversation.recipientId === otherUserId) ||
    (conversation.recipientId === currentUserId && conversation.senderId === otherUserId)
  )
}
