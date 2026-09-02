import { apiClient } from '@/modules/core/api/client'
import {
  Message,
  Conversation,
  User,
  SendMessageRequest,
  SendMessageResponse,
  CreateConversationResponse,
  isMessageArray,
  isConversationArray,
  isUserArray,
} from '../types'

export class ChatApiClient {
  async getConversations(userId: number): Promise<Conversation[]> {
    const response = await apiClient.get<Conversation[]>(`/conversations/${userId}`)

    if (!isConversationArray(response)) {
      throw new Error('Invalid conversations response format')
    }

    return response
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await apiClient.get<Message[]>(`/messages/${conversationId}`)

    if (!isMessageArray(response)) {
      throw new Error('Invalid messages response format')
    }

    return response
  }

  /**
   * `/messages/:id` is rewritten to a query filter server-side, and the query
   * is dropped on POST. The owning conversation and author therefore have to
   * travel in the body, otherwise the message is stored detached and never
   * shows up again in any conversation.
   */
  async sendMessage(
    conversationId: number,
    request: SendMessageRequest
  ): Promise<SendMessageResponse> {
    const response = await apiClient.post<SendMessageResponse>(
      `/messages/${conversationId}`,
      { ...request, conversationId }
    )

    if (!response || typeof response.id !== 'number') {
      throw new Error('Invalid send message response format')
    }

    return response
  }

  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users')

    if (!isUserArray(response)) {
      throw new Error('Invalid users response format')
    }

    return response
  }

  /**
   * The spec only requires `recipientId`, but the conversation list is filtered
   * on `senderId`/`recipientId` and rendered from the stored nicknames. A record
   * holding just the recipient id would be created and then never listed again.
   */
  async createConversation(
    sender: User,
    recipient: User
  ): Promise<CreateConversationResponse> {
    const response = await apiClient.post<CreateConversationResponse>(
      `/conversations/${sender.id}`,
      {
        recipientId: recipient.id,
        recipientNickname: recipient.nickname,
        senderId: sender.id,
        senderNickname: sender.nickname,
        lastMessageTimestamp: Math.floor(Date.now() / 1000),
      }
    )

    if (!response || typeof response.id !== 'number') {
      throw new Error('Invalid create conversation response format')
    }

    return response
  }

 
  async deleteConversation(conversationId: number): Promise<void> {
    await apiClient.delete<void>(`/conversation/${conversationId}`)
  }

  /** Same issue and same fix as deleteConversation, for `/message/:id`. */
  async deleteMessage(messageId: number): Promise<void> {
    await apiClient.delete<void>(`/message/${messageId}`)
  }
}

export const chatApiClient = new ChatApiClient()
