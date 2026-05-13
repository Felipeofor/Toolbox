import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { getFilesData, getFilesList } from '../api/client.js'

export const fetchFilesData = createAsyncThunk(
  'files/fetchData',
  async (fileName, { rejectWithValue }) => {
    try {
      return await getFilesData(fileName)
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status || 0 })
    }
  }
)

export const fetchFilesList = createAsyncThunk(
  'files/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getFilesList()
      return res.files || []
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status || 0 })
    }
  }
)

const initialState = {
  data: [],
  list: [],
  filter: '',
  loading: false,
  error: null
}

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setFilter (state, action) {
      state.filter = action.payload || ''
    },
    clearFilter (state) {
      state.filter = ''
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilesData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFilesData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchFilesData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || { message: 'Unknown error', status: 0 }
        state.data = []
      })
      .addCase(fetchFilesList.fulfilled, (state, action) => {
        state.list = action.payload
      })
  }
})

export const { setFilter, clearFilter } = filesSlice.actions
export default filesSlice.reducer
