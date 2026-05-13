import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'

import MainTabs from '../src/components/MainTabs.jsx'
import filesReducer from '../src/store/filesSlice.js'

jest.mock('../src/components/DashboardPanel.jsx', () => () => <div>__DASHBOARD__</div>)
jest.mock('../src/components/FilesPanel.jsx', () => () => <div>__FILES__</div>)

function renderWith (activeTab = 'dashboard') {
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
        activeTab
      }
    }
  })
  return {
    store,
    ...render(<Provider store={store}><MainTabs /></Provider>)
  }
}

describe('<MainTabs />', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear()
  })

  it('renders Dashboard panel by default', () => {
    renderWith('dashboard')
    expect(screen.getByText('__DASHBOARD__')).toBeInTheDocument()
    expect(screen.queryByText('__FILES__')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /dashboard/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('renders Files panel when activeTab is files', () => {
    renderWith('files')
    expect(screen.getByText('__FILES__')).toBeInTheDocument()
    expect(screen.queryByText('__DASHBOARD__')).not.toBeInTheDocument()
  })

  it('switches tabs on click and persists', () => {
    const { store } = renderWith('dashboard')
    fireEvent.click(screen.getByRole('tab', { name: /files/i }))
    expect(store.getState().files.activeTab).toBe('files')
    expect(localStorage.getItem('toolbox.activeTab')).toBe('files')
    expect(screen.getByText('__FILES__')).toBeInTheDocument()
  })
})
