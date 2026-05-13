import React, { useEffect, Suspense, lazy } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

import { fetchFilesData, fetchFilesList, fetchFilesStats, setActiveTab } from '../store/filesSlice.js'
import { selectLoading, selectError, selectStats } from '../store/selectors.js'
import KpiCards from './KpiCards.jsx'
import SkeletonTable from './SkeletonTable.jsx'

const DataQuality = lazy(() => import('./DataQuality.jsx'))

export default function DashboardPanel () {
  const dispatch = useDispatch()
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)
  const stats = useSelector(selectStats)

  useEffect(() => {
    dispatch(fetchFilesData())
    dispatch(fetchFilesList())
    dispatch(fetchFilesStats())
  }, [dispatch])

  function retry () {
    dispatch(fetchFilesData())
    dispatch(fetchFilesStats())
  }

  function goToFiles () {
    dispatch(setActiveTab('files'))
  }

  return (
    <section aria-labelledby='dashboard-heading'>
      <h2 id='dashboard-heading' className='visually-hidden'>Pipeline dashboard</h2>

      <KpiCards />

      {error && (
        <Alert variant='danger' role='alert' className='d-flex align-items-center justify-content-between'>
          <span>
            <strong>Error {error.status || ''}:</strong> {error.message}
          </span>
          <Button size='sm' variant='outline-danger' onClick={retry}>Retry</Button>
        </Alert>
      )}

      {loading && !stats && <SkeletonTable rows={4} />}

      <Suspense fallback={<SkeletonTable rows={4} />}>
        <DataQuality />
      </Suspense>

      <div className='d-flex justify-content-end mt-3'>
        <Button variant='outline-primary' onClick={goToFiles}>
          View raw data →
        </Button>
      </div>
    </section>
  )
}
