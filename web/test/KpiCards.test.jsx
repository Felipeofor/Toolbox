import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'

import KpiCards from '../src/components/KpiCards.jsx'
import filesReducer from '../src/store/filesSlice.js'

function renderWith (stats) {
  const store = configureStore({
    reducer: { files: filesReducer },
    preloadedState: {
      files: {
        data: [],
        list: [],
        filter: '',
        search: '',
        sortBy: 'file',
        sortDir: 'asc',
        stats,
        loading: false,
        error: null
      }
    }
  })
  return render(<Provider store={store}><KpiCards /></Provider>)
}

describe('<KpiCards />', () => {
  it('renders nothing when stats are missing', () => {
    const { container } = renderWith(null)
    expect(container.firstChild).toBeNull()
  })

  it('renders four KPIs with key numbers', () => {
    renderWith({
      summary: {
        filesListed: 9,
        filesWithData: 3,
        filesEmpty: 6,
        filesFailed: 0,
        linesValid: 15,
        linesDiscarded: 5,
        linesConsidered: 20,
        successRate: 0.75
      },
      perFile: []
    })
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText(/5 discarded/i)).toBeInTheDocument()
  })
})
