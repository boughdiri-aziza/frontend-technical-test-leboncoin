export interface Message {
  id: number
  conversationId: number
  authorId: number
  timestamp: number
  body: string
}

export interface Conversation {
  id: number
  recipientId: number
  recipientNickname: string
  senderId: number
  senderNickname: string
  lastMessageTimestamp: number
}

export interface ConversationDetail extends Conversation {
  messages: Message[]
}

export interface SendMessageRequest {
  body: string
  timestamp: number
  authorId: number
}

export interface SendMessageResponse {
  id: number
  conversationId: number
  authorId: number
  timestamp: number
  body: string
}

export interface User {
  id: number
  nickname: string
  token?: string
}

export interface CreateConversationRequest {
  recipientId: number
}

export interface CreateConversationResponse {
  id: number
}

export interface ApiResponse<T> {
  data: T
  error?: string
  timestamp: number
}

export const isMessage = (obj: unknown): obj is Message => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'conversationId' in obj &&
    'authorId' in obj &&
    'body' in obj &&
    'timestamp' in obj &&
    typeof (obj as Message).id === 'number' &&
    typeof (obj as Message).conversationId === 'number' &&
    typeof (obj as Message).authorId === 'number' &&
    typeof (obj as Message).body === 'string' &&
    typeof (obj as Message).timestamp === 'number'
  )
}

export const isConversation = (obj: unknown): obj is Conversation => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'recipientId' in obj &&
    'senderId' in obj &&
    typeof (obj as Conversation).id === 'number' &&
    typeof (obj as Conversation).recipientId === 'number' &&
    typeof (obj as Conversation).senderId === 'number'
  )
}

export const isUser = (obj: unknown): obj is User => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'nickname' in obj &&
    typeof (obj as User).id === 'number' &&
    typeof (obj as User).nickname === 'string'
  )
}

export const isUserArray = (arr: unknown): arr is User[] => {
  return Array.isArray(arr) && arr.every(isUser)
}

export const isMessageArray = (arr: unknown[]): arr is Message[] => {
  return Array.isArray(arr) && arr.every(isMessage)
}

export const isConversationArray = (arr: unknown[]): arr is Conversation[] => {
  return Array.isArray(arr) && arr.every(isConversation)
}
