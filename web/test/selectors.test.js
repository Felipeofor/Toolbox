import {
  selectData,
  selectFilter,
  selectFlattenedRows,
  selectRowCount
} from '../src/store/selectors.js'

const HEX = '70ad29aacf0b690b0467fe2b2767f765'
const state = {
  files: {
    data: [
      { file: 'a.csv', lines: [{ text: 'x', number: 1, hex: HEX }] },
      { file: 'b.csv', lines: [{ text: 'y', number: 2, hex: HEX }, { text: 'z', number: 3, hex: HEX }] }
    ],
    list: [],
    filter: 'a',
    loading: false,
    error: null
  }
}

describe('store/selectors', () => {
  it('selectData returns the data array', () => {
    expect(selectData(state)).toBe(state.files.data)
  })

  it('selectFilter returns the filter', () => {
    expect(selectFilter(state)).toBe('a')
  })

  it('selectRowCount counts all lines across entries', () => {
    expect(selectRowCount(state)).toBe(3)
  })

  it('selectFlattenedRows produces one row per line with stable keys', () => {
    const rows = selectFlattenedRows(state)
    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({ file: 'a.csv', text: 'x', number: 1, hex: HEX })
    expect(new Set(rows.map((r) => r.key)).size).toBe(rows.length)
  })

  it('memoizes when input state slice is the same reference', () => {
    const first = selectFlattenedRows(state)
    const second = selectFlattenedRows(state)
    expect(second).toBe(first)
  })
})
