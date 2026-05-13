import React from 'react'
import { Table } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

import {
  selectVisibleRows,
  selectRowCount,
  selectSortBy,
  selectSortDir,
  selectSearch
} from '../store/selectors.js'
import { toggleSort } from '../store/filesSlice.js'

const COLUMNS = [
  { key: 'file', label: 'File Name' },
  { key: 'text', label: 'Text' },
  { key: 'number', label: 'Number' },
  { key: 'hex', label: 'Hex' }
]

function SortIndicator ({ active, dir }) {
  if (!active) return <span aria-hidden='true' className='ms-1 text-muted'>↕</span>
  return <span aria-hidden='true' className='ms-1'>{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function FilesTable () {
  const dispatch = useDispatch()
  const rows = useSelector(selectVisibleRows)
  const total = useSelector(selectRowCount)
  const sortBy = useSelector(selectSortBy)
  const sortDir = useSelector(selectSortDir)
  const search = useSelector(selectSearch)

  if (rows.length === 0) {
    return (
      <div className='text-muted' role='status' aria-live='polite'>
        {search ? `No rows match “${search}”.` : 'No data to display.'}
      </div>
    )
  }

  return (
    <>
      <p className='text-muted small mb-2' aria-live='polite'>
        Showing <strong>{rows.length}</strong> of <strong>{total}</strong>{' '}
        {total === 1 ? 'row' : 'rows'}
        {search && <> · filter: <code>{search}</code></>}
      </p>
      <Table striped bordered hover responsive size='sm' aria-label='Files contents'>
        <thead>
          <tr>
            {COLUMNS.map((c) => {
              const active = sortBy === c.key
              return (
                <th
                  key={c.key}
                  scope='col'
                  role='button'
                  tabIndex={0}
                  aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  onClick={() => dispatch(toggleSort(c.key))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      dispatch(toggleSort(c.key))
                    }
                  }}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  {c.label}
                  <SortIndicator active={active} dir={sortDir} />
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>{r.file}</td>
              <td>{r.text}</td>
              <td>{r.number}</td>
              <td><code>{r.hex}</code></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}
