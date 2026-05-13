import React from 'react'
import { Card, Table, ProgressBar, Badge } from 'react-bootstrap'
import { useSelector } from 'react-redux'

import { selectPerFileQuality } from '../store/selectors.js'

function statusBadge (status) {
  if (status === 'download_failed') return <Badge bg='danger'>Failed</Badge>
  return <Badge bg='success'>OK</Badge>
}

function qualityVariant (pct) {
  if (pct >= 80) return 'success'
  if (pct >= 50) return 'warning'
  return 'danger'
}

export default function DataQuality () {
  const perFile = useSelector(selectPerFileQuality)
  if (!perFile.length) return null

  return (
    <Card className='mb-4'>
      <Card.Header>
        <strong>Data Quality</strong>
        <span className='text-muted small ms-2'>per-file parse stats</span>
      </Card.Header>
      <Card.Body className='p-0'>
        <Table responsive hover className='m-0' aria-label='Data quality per file'>
          <thead>
            <tr>
              <th scope='col'>File</th>
              <th scope='col' className='text-end'>Valid</th>
              <th scope='col' className='text-end'>Discarded</th>
              <th scope='col' style={{ minWidth: 180 }}>Success rate</th>
              <th scope='col'>Status</th>
            </tr>
          </thead>
          <tbody>
            {perFile.map((f) => (
              <tr key={f.file}>
                <td><code>{f.file}</code></td>
                <td className='text-end'>{f.valid}</td>
                <td className='text-end'>{f.discarded}</td>
                <td>
                  <ProgressBar
                    now={f.successRatePct}
                    label={`${f.successRatePct}%`}
                    variant={qualityVariant(f.successRatePct)}
                    aria-label={`Success rate for ${f.file}`}
                  />
                </td>
                <td>{statusBadge(f.status)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}
