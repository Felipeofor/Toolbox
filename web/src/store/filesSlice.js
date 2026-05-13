import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { getFilesData, getFilesList, getFilesStats } from '../api/client.js'

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

export const fetchFilesStats = createAsyncThunk(
  'files/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await getFilesStats()
    } catch (err) {
      return rejectWithValue({ message: err.message, status: err.status || 0 })
    }
  }
)

const initialState = {
  data: [],
  list: [],
  filter: '',
  search: '',
  sortBy: 'file',
  sortDir: 'asc',
  stats: null,
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
    },
    setSearch (state, action) {
      state.search = action.payload || ''
    },
    clearSearch (state) {
      state.search = ''
    },
    setSort (state, action) {
      const { sortBy, sortDir } = action.payload
      state.sortBy = sortBy
      state.sortDir = sortDir
    },
    toggleSort (state, action) {
      const column = action.payload
      if (state.sortBy === column) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        state.sortBy = column
        state.sortDir = 'asc'
      }
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
      .addCase(fetchFilesStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
  }
})

export const {
  setFilter,
  clearFilter,
  setSearch,
  clearSearch,
  setSort,
  toggleSort
} = filesSlice.actions

export default filesSlice.reducer
