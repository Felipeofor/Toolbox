import React, { useEffect, Suspense, lazy } from 'react'
import { Alert, Button, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

import { fetchFilesData, fetchFilesList, fetchFilesStats } from '../store/filesSlice.js'
import { selectLoading, selectError } from '../store/selectors.js'
import SearchBar from './SearchBar.jsx'
import KpiCards from './KpiCards.jsx'
import SkeletonTable from './SkeletonTable.jsx'

const FilesTable = lazy(() => import('./FilesTable.jsx'))
const DataQuality = lazy(() => import('./DataQuality.jsx'))

export default function DashboardPanel () {
  const dispatch = useDispatch()
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)

  useEffect(() => {
    dispatch(fetchFilesData())
    dispatch(fetchFilesList())
    dispatch(fetchFilesStats())
  }, [dispatch])

  function retry () {
    dispatch(fetchFilesData())
    dispatch(fetchFilesStats())
  }

  return (
    <section aria-labelledby='dashboard-heading'>
      <h2 id='dashboard-heading' className='visually-hidden'>Pipeline dashboard</h2>

      <KpiCards />

      <Suspense fallback={<SkeletonTable rows={3} />}>
        <DataQuality />
      </Suspense>

      {error && (
        <Alert variant='danger' role='alert' className='d-flex align-items-center justify-content-between'>
          <span>
            <strong>Error {error.status || ''}:</strong> {error.message}
          </span>
          <Button size='sm' variant='outline-danger' onClick={retry}>Retry</Button>
        </Alert>
      )}

      <Card>
        <Card.Header className='bg-white'>
          <SearchBar />
        </Card.Header>
        <Card.Body>
          {loading && <SkeletonTable />}
          {!loading && !error && (
            <Suspense fallback={<SkeletonTable rows={6} />}>
              <FilesTable />
            </Suspense>
          )}
        </Card.Body>
      </Card>
    </section>
  )
}
