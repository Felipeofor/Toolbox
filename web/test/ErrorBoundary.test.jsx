import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import ErrorBoundary from '../src/components/ErrorBoundary.jsx'

function Boom () {
  throw new Error('boom test')
}

describe('<ErrorBoundary />', () => {
  const originalError = console.error

  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <span>hello</span>
      </ErrorBoundary>
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('catches a child error and shows a fallback', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByText(/boom test/i)).toBeInTheDocument()
  })
})
