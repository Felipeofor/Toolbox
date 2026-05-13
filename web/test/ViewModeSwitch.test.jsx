import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'

import ViewModeSwitch from '../src/components/ViewModeSwitch.jsx'
import filesReducer from '../src/store/filesSlice.js'

function renderWith (viewMode = 'full') {
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
        viewMode
      }
    }
  })
  return {
    store,
    ...render(<Provider store={store}><ViewModeSwitch /></Provider>)
  }
}

describe('<ViewModeSwitch />', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear()
  })

  it('renders a labeled switch', () => {
    renderWith('full')
    expect(screen.getByLabelText(/baseline view/i)).toBeInTheDocument()
  })

  it('is unchecked in full mode', () => {
    renderWith('full')
    expect(screen.getByLabelText(/baseline view/i)).not.toBeChecked()
  })

  it('is checked in baseline mode', () => {
    renderWith('baseline')
    expect(screen.getByLabelText(/baseline view/i)).toBeChecked()
  })

  it('dispatches setViewMode on toggle and persists', () => {
    const { store } = renderWith('full')
    fireEvent.click(screen.getByLabelText(/baseline view/i))
    expect(store.getState().files.viewMode).toBe('baseline')
    expect(localStorage.getItem('toolbox.viewMode')).toBe('baseline')
  })
})
