import React from 'react'
import { Table } from 'react-bootstrap'

export default function SkeletonTable ({ rows = 8 }) {
  const filler = Array.from({ length: rows })
  return (
    <Table striped bordered responsive size='sm' aria-busy='true' aria-label='Loading data'>
      <thead>
        <tr>
          <th>File Name</th>
          <th>Text</th>
          <th>Number</th>
          <th>Hex</th>
        </tr>
      </thead>
      <tbody>
        {filler.map((_, i) => (
          <tr key={i}>
            <td><span className='skeleton skeleton-sm' style={{ width: '70%' }} /></td>
            <td><span className='skeleton skeleton-sm' style={{ width: '90%' }} /></td>
            <td><span className='skeleton skeleton-sm' style={{ width: '40%' }} /></td>
            <td><span className='skeleton skeleton-sm' style={{ width: '100%' }} /></td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
