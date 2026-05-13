import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'

import StatusPill from '../src/components/StatusPill.jsx'

describe('<StatusPill />', () => {
  const realFetch = global.fetch
  afterEach(() => {
    global.fetch = realFetch
  })

  it('shows API ready when /ready returns ready', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ status: 'ready' })
    }))
    await act(async () => {
      render(<StatusPill />)
    })
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/API ready/i))
  })

  it('shows API down on fetch failure', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('connection refused')))
    await act(async () => {
      render(<StatusPill />)
    })
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/API down/i))
  })
})
