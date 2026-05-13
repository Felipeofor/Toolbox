import React from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import { useSelector } from 'react-redux'

import { selectKpis } from '../store/selectors.js'

function Kpi ({ label, value, hint, variant }) {
  return (
    <Card className={`kpi-card border-${variant || 'secondary'} h-100`}>
      <Card.Body>
        <Card.Subtitle className='text-uppercase text-muted small mb-2'>{label}</Card.Subtitle>
        <div className='display-6 fw-semibold'>{value}</div>
        {hint && <div className='small text-muted mt-1'>{hint}</div>}
      </Card.Body>
    </Card>
  )
}

export default function KpiCards () {
  const kpis = useSelector(selectKpis)
  if (!kpis) return null

  return (
    <Row className='g-3 mb-4' aria-label='Pipeline KPIs'>
      <Col xs={6} md={3}>
        <Kpi label='Files listed' value={kpis.filesListed} hint='from upstream' variant='secondary' />
      </Col>
      <Col xs={6} md={3}>
        <Kpi
          label='Files with data'
          value={kpis.filesWithData}
          hint={`${kpis.filesEmpty} empty · ${kpis.filesFailed} failed`}
          variant={kpis.filesFailed > 0 ? 'warning' : 'success'}
        />
      </Col>
      <Col xs={6} md={3}>
        <Kpi
          label='Valid lines'
          value={kpis.linesValid}
          hint={`of ${kpis.linesConsidered} considered`}
          variant='primary'
        />
      </Col>
      <Col xs={6} md={3}>
        <Kpi
          label='Parse success'
          value={`${kpis.successRatePct}%`}
          hint={`${kpis.linesDiscarded} discarded`}
          variant={kpis.successRatePct >= 80 ? 'success' : kpis.successRatePct >= 50 ? 'warning' : 'danger'}
        />
      </Col>
    </Row>
  )
}
