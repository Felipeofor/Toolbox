import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'

import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { store } from './store/index.js'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <App />
    </Provider>
  </ErrorBoundary>
)
