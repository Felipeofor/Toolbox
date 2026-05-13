import React from 'react'
import { Table } from 'react-bootstrap'
import { useSelector } from 'react-redux'

import { selectFlattenedRows, selectRowCount } from '../store/selectors.js'

export default function FilesTable () {
  const rows = useSelector(selectFlattenedRows)
  const total = useSelector(selectRowCount)

  if (rows.length === 0) {
    return <div className='text-muted' role='status' aria-live='polite'>No data to display.</div>
  }

  return (
    <>
      <p className='text-muted small mb-2' aria-live='polite'>
        Showing <strong>{total}</strong> {total === 1 ? 'row' : 'rows'}
      </p>
      <Table striped bordered hover responsive size='sm' aria-label='Files contents'>
        <thead>
          <tr>
            <th scope='col'>File Name</th>
            <th scope='col'>Text</th>
            <th scope='col'>Number</th>
            <th scope='col'>Hex</th>
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
