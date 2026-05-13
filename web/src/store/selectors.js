import { createSelector } from '@reduxjs/toolkit'

const selectFiles = (state) => state.files

export const selectData = createSelector(selectFiles, (f) => f.data)
export const selectList = createSelector(selectFiles, (f) => f.list)
export const selectFilter = createSelector(selectFiles, (f) => f.filter)
export const selectLoading = createSelector(selectFiles, (f) => f.loading)
export const selectError = createSelector(selectFiles, (f) => f.error)

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
