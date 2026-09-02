import { apiClient } from '../../../core/api/client'
import { ChatApiClient } from '../chat-client'

jest.mock('../../../core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('ChatApiClient - delete endpoints', () => {
  let client: ChatApiClient

  beforeEach(() => {
    client = new ChatApiClient()
    jest.clearAllMocks()
    mockedApiClient.delete.mockResolvedValue(undefined)
  })

  it('calls the singular endpoint to delete a conversation', async () => {
    await client.deleteConversation(3)

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/conversation/3')
  })

  it('calls the singular endpoint to delete a message', async () => {
    await client.deleteMessage(42)

    expect(mockedApiClient.delete).toHaveBeenCalledWith('/message/42')
  })
})
