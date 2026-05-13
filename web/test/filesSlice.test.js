import { configureStore } from '@reduxjs/toolkit'

import filesReducer, {
  fetchFilesData,
  fetchFilesList,
  setFilter,
  clearFilter
} from '../src/store/filesSlice.js'

function buildStore () {
  return configureStore({ reducer: { files: filesReducer } })
}

describe('filesSlice', () => {
  const realFetch = global.fetch

  afterEach(() => {
    global.fetch = realFetch
  })

  it('has the expected initial state', () => {
    const store = buildStore()
    expect(store.getState().files).toMatchObject({
      data: [],
      list: [],
      filter: '',
      search: '',
      sortBy: 'file',
      sortDir: 'asc',
      stats: null,
      loading: false,
      error: null
    })
    expect(['dashboard', 'files']).toContain(store.getState().files.activeTab)
  })

  it('setFilter / clearFilter update filter', () => {
    const store = buildStore()
    store.dispatch(setFilter('file1.csv'))
    expect(store.getState().files.filter).toBe('file1.csv')
    store.dispatch(clearFilter())
    expect(store.getState().files.filter).toBe('')
  })

  it('fetchFilesData fulfilled populates data', async () => {
    const payload = [{ file: 'a.csv', lines: [] }]
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(payload)
    }))
    const store = buildStore()
    await store.dispatch(fetchFilesData())
    const state = store.getState().files
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.data).toEqual(payload)
  })

  it('fetchFilesData rejected sets error and resets data', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ error: 'upstream failed' })
    }))
    const store = buildStore()
    await store.dispatch(fetchFilesData())
    const state = store.getState().files
    expect(state.loading).toBe(false)
    expect(state.data).toEqual([])
    expect(state.error).toEqual({ message: 'upstream failed', status: 502 })
  })

  it('fetchFilesList fulfilled populates list', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ files: ['a.csv', 'b.csv'] })
    }))
    const store = buildStore()
    await store.dispatch(fetchFilesList())
    expect(store.getState().files.list).toEqual(['a.csv', 'b.csv'])
  })
})
