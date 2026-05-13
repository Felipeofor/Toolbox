import { createSelector } from '@reduxjs/toolkit'

const selectFiles = (state) => state.files

export const selectData = createSelector(selectFiles, (f) => f.data)
export const selectList = createSelector(selectFiles, (f) => f.list)
export const selectFilter = createSelector(selectFiles, (f) => f.filter)
export const selectSearch = createSelector(selectFiles, (f) => f.search)
export const selectSortBy = createSelector(selectFiles, (f) => f.sortBy)
export const selectSortDir = createSelector(selectFiles, (f) => f.sortDir)
export const selectLoading = createSelector(selectFiles, (f) => f.loading)
export const selectError = createSelector(selectFiles, (f) => f.error)
export const selectStats = createSelector(selectFiles, (f) => f.stats)
export const selectActiveTab = createSelector(selectFiles, (f) => f.activeTab)

export const selectRowCount = createSelector(selectData, (data) =>
  data.reduce((acc, entry) => acc + entry.lines.length, 0)
)

export const selectFlattenedRows = createSelector(selectData, (data) =>
  data.flatMap((entry, gi) =>
    entry.lines.map((l, li) => ({
      key: `${entry.file}-${gi}-${li}`,
      file: entry.file,
      text: l.text,
      number: l.number,
      hex: l.hex
    }))
  )
)

function compare (a, b, dir) {
  if (a < b) return dir === 'asc' ? -1 : 1
  if (a > b) return dir === 'asc' ? 1 : -1
  return 0
}

export const selectVisibleRows = createSelector(
  selectFlattenedRows,
  selectSearch,
  selectSortBy,
  selectSortDir,
  (rows, search, sortBy, sortDir) => {
    let out = rows
    const q = search.trim().toLowerCase()
    if (q) {
      out = out.filter((r) =>
        r.file.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q) ||
        r.hex.toLowerCase().includes(q) ||
        String(r.number).includes(q)
      )
    }
    if (sortBy) {
      out = [...out].sort((a, b) => compare(a[sortBy], b[sortBy], sortDir))
    }
    return out
  }
)

export const selectKpis = createSelector(selectStats, (stats) => {
  if (!stats) return null
  return {
    filesListed: stats.summary.filesListed,
    filesWithData: stats.summary.filesWithData,
    filesEmpty: stats.summary.filesEmpty,
    filesFailed: stats.summary.filesFailed,
    linesValid: stats.summary.linesValid,
    linesDiscarded: stats.summary.linesDiscarded,
    linesConsidered: stats.summary.linesConsidered,
    successRatePct: Math.round(stats.summary.successRate * 1000) / 10
  }
})

export const selectPerFileQuality = createSelector(selectStats, (stats) => {
  if (!stats) return []
  return stats.perFile.map((f) => ({
    ...f,
    successRatePct: Math.round(f.successRate * 1000) / 10
  }))
})
