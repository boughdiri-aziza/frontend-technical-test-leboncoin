import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MessageInput } from '../MessageInput'

describe('MessageInput', () => {
  it('renders a textarea and a disabled send button when empty', () => {
    render(<MessageInput onSend={jest.fn()} />)

    expect(screen.getByLabelText('Message input')).toBeInTheDocument()
    expect(screen.getByLabelText('Send message')).toBeDisabled()
  })

  it('enables the send button once text is typed', () => {
    render(<MessageInput onSend={jest.fn()} />)

    fireEvent.change(screen.getByLabelText('Message input'), {
      target: { value: 'Hello' },
    })

    expect(screen.getByLabelText('Send message')).toBeEnabled()
    expect(screen.getByText('5 / 5000')).toBeInTheDocument()
  })

  it('calls onSend with the trimmed message and clears the field on success', async () => {
    const onSend = jest.fn().mockResolvedValue(undefined)
    render(<MessageInput onSend={onSend} />)

    const textarea = screen.getByLabelText('Message input')
    fireEvent.change(textarea, { target: { value: '  hello world  ' } })
    fireEvent.click(screen.getByLabelText('Send message'))

    await waitFor(() => expect(onSend).toHaveBeenCalledWith('hello world'))
    await waitFor(() => expect(textarea).toHaveValue(''))
  })

  it('sends the message on Ctrl+Enter', async () => {
    const onSend = jest.fn().mockResolvedValue(undefined)
    render(<MessageInput onSend={onSend} />)

    const textarea = screen.getByLabelText('Message input')
    fireEvent.change(textarea, { target: { value: 'hello' } })
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

    await waitFor(() => expect(onSend).toHaveBeenCalledWith('hello'))
  })

  it('does not call onSend for a whitespace-only message', () => {
    const onSend = jest.fn()
    render(<MessageInput onSend={onSend} />)

    const textarea = screen.getByLabelText('Message input')
    fireEvent.change(textarea, { target: { value: '   ' } })
    // the send button stays disabled for empty/whitespace input, so submit via Ctrl+Enter instead
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

    expect(onSend).not.toHaveBeenCalled()
  })

  it('shows an error message when onSend rejects', async () => {
    const onSend = jest.fn().mockRejectedValue(new Error('Network error'))
    render(<MessageInput onSend={onSend} />)

    fireEvent.change(screen.getByLabelText('Message input'), {
      target: { value: 'hello' },
    })
    fireEvent.click(screen.getByLabelText('Send message'))

    expect(await screen.findByRole('alert')).toHaveTextContent('Network error')
  })

  it('disables the input and button when the disabled prop is true', () => {
    render(<MessageInput onSend={jest.fn()} disabled />)

    expect(screen.getByLabelText('Message input')).toBeDisabled()
    expect(screen.getByLabelText('Send message')).toBeDisabled()
  })

  it('displays an externally provided error', () => {
    render(<MessageInput onSend={jest.fn()} error="Something went wrong" />)

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
  })
})
