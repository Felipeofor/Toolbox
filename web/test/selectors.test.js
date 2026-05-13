import {
  selectData,
  selectFilter,
  selectFlattenedRows,
  selectRowCount,
  selectVisibleRows,
  selectKpis,
  selectPerFileQuality
} from '../src/store/selectors.js'

const HEX = '70ad29aacf0b690b0467fe2b2767f765'

function baseState (overrides = {}) {
  return {
    files: {
      data: [
        { file: 'a.csv', lines: [{ text: 'apple', number: 1, hex: HEX }] },
        {
          file: 'b.csv',
          lines: [
            { text: 'banana', number: 2, hex: HEX },
            { text: 'cherry', number: 3, hex: HEX }
          ]
        }
      ],
      list: [],
      filter: 'a',
      search: '',
      sortBy: 'file',
      sortDir: 'asc',
      stats: null,
      loading: false,
      error: null,
      ...overrides
    }
  }
}

describe('store/selectors', () => {
  it('selectData returns the data array', () => {
    const s = baseState()
    expect(selectData(s)).toBe(s.files.data)
  })

  it('selectFilter returns the filter', () => {
    expect(selectFilter(baseState())).toBe('a')
  })

  it('selectRowCount counts all lines across entries', () => {
    expect(selectRowCount(baseState())).toBe(3)
  })

  it('selectFlattenedRows produces one row per line with stable keys', () => {
    const rows = selectFlattenedRows(baseState())
    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({ file: 'a.csv', text: 'apple', number: 1, hex: HEX })
    expect(new Set(rows.map((r) => r.key)).size).toBe(rows.length)
  })

  it('selectVisibleRows applies client-side partial search', () => {
    const rows = selectVisibleRows(baseState({ search: 'ban' }))
    expect(rows).toHaveLength(1)
    expect(rows[0].text).toBe('banana')
  })

  it('selectVisibleRows search is case-insensitive', () => {
    const rows = selectVisibleRows(baseState({ search: 'APPLE' }))
    expect(rows).toHaveLength(1)
    expect(rows[0].text).toBe('apple')
  })

  it('selectVisibleRows search also matches file and number', () => {
    expect(selectVisibleRows(baseState({ search: 'b.csv' }))).toHaveLength(2)
    expect(selectVisibleRows(baseState({ search: '3' }))).toHaveLength(1)
  })

  it('selectVisibleRows sorts by selected column', () => {
    const asc = selectVisibleRows(baseState({ sortBy: 'text', sortDir: 'asc' }))
    expect(asc.map((r) => r.text)).toEqual(['apple', 'banana', 'cherry'])
    const desc = selectVisibleRows(baseState({ sortBy: 'text', sortDir: 'desc' }))
    expect(desc.map((r) => r.text)).toEqual(['cherry', 'banana', 'apple'])
  })

  it('selectKpis returns null when no stats yet', () => {
    expect(selectKpis(baseState())).toBeNull()
  })

  it('selectKpis maps stats summary into UI-friendly shape', () => {
    const s = baseState({
      stats: {
        summary: {
          filesListed: 4,
          filesWithData: 2,
          filesEmpty: 1,
          filesFailed: 1,
          linesValid: 5,
          linesDiscarded: 3,
          linesConsidered: 8,
          successRate: 0.625
        },
        perFile: []
      }
    })
    const kpis = selectKpis(s)
    expect(kpis).toMatchObject({
      filesListed: 4,
      filesWithData: 2,
      filesEmpty: 1,
      filesFailed: 1,
      linesValid: 5,
      linesDiscarded: 3,
      linesConsidered: 8,
      successRatePct: 62.5
    })
  })

  it('selectPerFileQuality enriches each row with successRatePct', () => {
    const s = baseState({
      stats: {
        summary: {},
        perFile: [
          { file: 'a.csv', valid: 4, discarded: 1, considered: 5, successRate: 0.8, status: 'ok' }
        ]
      }
    })
    const out = selectPerFileQuality(s)
    expect(out[0]).toMatchObject({ file: 'a.csv', successRatePct: 80 })
  })

  it('memoizes when input state slice is the same reference', () => {
    const s = baseState()
    expect(selectFlattenedRows(s)).toBe(selectFlattenedRows(s))
  })
})
