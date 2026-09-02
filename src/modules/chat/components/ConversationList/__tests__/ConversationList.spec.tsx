import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConversationList } from '../ConversationList'
import { Conversation } from '../../../types'

const CURRENT_USER_ID = 1

const buildConversation = (overrides: Partial<Conversation>): Conversation => ({
  id: 1,
  senderId: CURRENT_USER_ID,
  senderNickname: 'Me',
  recipientId: 2,
  recipientNickname: 'Patrick',
  lastMessageTimestamp: 1000,
  ...overrides,
})

describe('ConversationList', () => {
  it('shows a loading skeleton while loading', () => {
    const { container } = render(
      <ConversationList
        conversations={[]}
        currentUserId={CURRENT_USER_ID}
        selectedId={null}
        onSelect={jest.fn()}
        loading
      />
    )

    expect(container.querySelectorAll('[class*="skeletonItem"]').length).toBeGreaterThan(0)
  })

  it('shows an error message when error is provided', () => {
    render(
      <ConversationList
        conversations={[]}
        currentUserId={CURRENT_USER_ID}
        selectedId={null}
        onSelect={jest.fn()}
        error="Failed to load conversations"
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load conversations')
  })

  it('shows an empty state when there are no conversations', () => {
    render(
      <ConversationList
        conversations={[]}
        currentUserId={CURRENT_USER_ID}
        selectedId={null}
        onSelect={jest.fn()}
      />
    )

    expect(screen.getByText('No conversations yet')).toBeInTheDocument()
  })

  it('sorts conversations by most recent message first', () => {
    const conversations = [
      buildConversation({ id: 1, recipientNickname: 'Elodie', lastMessageTimestamp: 1000 }),
      buildConversation({ id: 2, recipientNickname: 'Patrick', lastMessageTimestamp: 3000 }),
      buildConversation({ id: 3, recipientNickname: 'Jeremie', lastMessageTimestamp: 2000 }),
    ]

    render(
      <ConversationList
        conversations={conversations}
        currentUserId={CURRENT_USER_ID}
        selectedId={null}
        onSelect={jest.fn()}
      />
    )

    const items = screen.getAllByRole('button', { name: /Conversation with/ })
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining('Patrick'),
      expect.stringContaining('Jeremie'),
      expect.stringContaining('Elodie'),
    ])
  })

  it('calls onSelect with the conversation id when an item is clicked', () => {
    const onSelect = jest.fn()
    const conversations = [buildConversation({ id: 42, recipientNickname: 'Patrick' })]

    render(
      <ConversationList
        conversations={conversations}
        currentUserId={CURRENT_USER_ID}
        selectedId={null}
        onSelect={onSelect}
      />
    )

    fireEvent.click(screen.getByLabelText('Conversation with Patrick'))

    expect(onSelect).toHaveBeenCalledWith(42)
  })

  it('marks the selected conversation as pressed', () => {
    const conversations = [buildConversation({ id: 42, recipientNickname: 'Patrick' })]

    render(
      <ConversationList
        conversations={conversations}
        currentUserId={CURRENT_USER_ID}
        selectedId={42}
        onSelect={jest.fn()}
      />
    )

    expect(screen.getByLabelText('Conversation with Patrick')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('calls onNewConversation when the "New" button is clicked', () => {
    const onNewConversation = jest.fn()

    render(
      <ConversationList
        conversations={[]}
        currentUserId={CURRENT_USER_ID}
        selectedId={null}
        onSelect={jest.fn()}
        onNewConversation={onNewConversation}
      />
    )

    fireEvent.click(screen.getByLabelText('Start a new conversation'))

    expect(onNewConversation).toHaveBeenCalledTimes(1)
  })

  it('does not render the "New" button when onNewConversation is not provided', () => {
    render(
      <ConversationList
        conversations={[]}
        currentUserId={CURRENT_USER_ID}
        selectedId={null}
        onSelect={jest.fn()}
      />
    )

    expect(screen.queryByLabelText('Start a new conversation')).not.toBeInTheDocument()
  })
})
