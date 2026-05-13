import { configureStore } from '@reduxjs/toolkit'

import filesReducer from './filesSlice.js'

export const store = configureStore({
  reducer: {
    files: filesReducer
  }
})
