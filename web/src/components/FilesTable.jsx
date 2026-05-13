import React from 'react'
import { Table } from 'react-bootstrap'

export default function FilesTable ({ data }) {
  const rows = data.flatMap((group) =>
    group.lines.map((l, idx) => ({
      key: `${group.file}-${idx}`,
      file: group.file,
      text: l.text,
      number: l.number,
      hex: l.hex
    }))
  )

  if (rows.length === 0) {
    return <div className='text-muted'>No data to display.</div>
  }

  return (
    <Table striped bordered hover responsive size='sm'>
      <thead>
        <tr>
          <th>File Name</th>
          <th>Text</th>
          <th>Number</th>
          <th>Hex</th>
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
  )
}
