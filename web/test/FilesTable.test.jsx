import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'

import FilesTable from '../src/components/FilesTable.jsx'
import filesReducer from '../src/store/filesSlice.js'

const HEX = '70ad29aacf0b690b0467fe2b2767f765'

function renderWith (data) {
  const store = configureStore({
    reducer: { files: filesReducer },
    preloadedState: {
      files: { data, list: [], filter: '', loading: false, error: null }
    }
  })
  return render(
    <Provider store={store}>
      <FilesTable />
    </Provider>
  )
}

describe('<FilesTable />', () => {
  it('shows empty state when no data', () => {
    renderWith([])
    expect(screen.getByText(/no data to display/i)).toBeInTheDocument()
  })

  it('flattens lines and renders one row per line', () => {
    renderWith([
      { file: 'a.csv', lines: [{ text: 'one', number: 1, hex: HEX }] },
      {
        file: 'b.csv',
        lines: [
          { text: 'two', number: 2, hex: HEX },
          { text: 'three', number: 3, hex: HEX }
        ]
      }
    ])
    expect(screen.getAllByRole('row')).toHaveLength(4)
    expect(screen.getByText('one')).toBeInTheDocument()
    expect(screen.getAllByText('a.csv')).toHaveLength(1)
    expect(screen.getAllByText('b.csv')).toHaveLength(2)
    expect(screen.getByText(/Showing/i)).toBeInTheDocument()
  })

  it('has an accessible name for the table', () => {
    renderWith([{ file: 'a.csv', lines: [{ text: 'x', number: 1, hex: HEX }] }])
    expect(screen.getByRole('table', { name: /files contents/i })).toBeInTheDocument()
  })
})
