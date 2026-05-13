import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'

import FilesTable from '../src/components/FilesTable.jsx'
import filesReducer from '../src/store/filesSlice.js'

const HEX = '70ad29aacf0b690b0467fe2b2767f765'

function renderWith (overrides = {}) {
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
        stats: null,
        loading: false,
        error: null,
        ...overrides
      }
    }
  })
  return {
    store,
    ...render(
      <Provider store={store}>
        <FilesTable />
      </Provider>
    )
  }
}

describe('<FilesTable />', () => {
  it('shows empty state when no data', () => {
    renderWith()
    expect(screen.getByText(/no data to display/i)).toBeInTheDocument()
  })

  it('flattens lines and renders one row per line', () => {
    renderWith({
      data: [
        { file: 'a.csv', lines: [{ text: 'one', number: 1, hex: HEX }] },
        {
          file: 'b.csv',
          lines: [
            { text: 'two', number: 2, hex: HEX },
            { text: 'three', number: 3, hex: HEX }
          ]
        }
      ]
    })
    expect(screen.getAllByRole('row')).toHaveLength(4)
    expect(screen.getByText('one')).toBeInTheDocument()
  })

  it('filters rows via client-side search', () => {
    renderWith({
      data: [
        { file: 'a.csv', lines: [{ text: 'apple', number: 1, hex: HEX }] },
        { file: 'b.csv', lines: [{ text: 'banana', number: 2, hex: HEX }] }
      ],
      search: 'ban'
    })
    expect(screen.getByText('banana')).toBeInTheDocument()
    expect(screen.queryByText('apple')).not.toBeInTheDocument()
    expect(screen.getByText(/filter:/i)).toBeInTheDocument()
  })

  it('shows empty-search message when search matches nothing', () => {
    renderWith({
      data: [{ file: 'a.csv', lines: [{ text: 'apple', number: 1, hex: HEX }] }],
      search: 'zzz'
    })
    expect(screen.getByText(/No rows match/i)).toBeInTheDocument()
  })

  it('toggles sort direction on header click', () => {
    const { store } = renderWith({
      data: [
        { file: 'a.csv', lines: [{ text: 'x', number: 1, hex: HEX }] }
      ]
    })
    const fileHeader = screen.getByRole('button', { name: /file name/i })
    expect(fileHeader.getAttribute('aria-sort')).toBe('ascending')
    fireEvent.click(fileHeader)
    expect(store.getState().files.sortDir).toBe('desc')
  })

  it('has an accessible table name', () => {
    renderWith({ data: [{ file: 'a.csv', lines: [{ text: 'x', number: 1, hex: HEX }] }] })
    expect(screen.getByRole('table', { name: /files contents/i })).toBeInTheDocument()
  })
})
