import React, { useEffect, Suspense, lazy } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

import { fetchFilesData, fetchFilesList, fetchFilesStats } from '../store/filesSlice.js'
import { selectLoading, selectError } from '../store/selectors.js'
import SearchBar from './SearchBar.jsx'
import KpiCards from './KpiCards.jsx'
import SkeletonTable from './SkeletonTable.jsx'

const FilesTable = lazy(() => import('./FilesTable.jsx'))
const DataQuality = lazy(() => import('./DataQuality.jsx'))

export default function FilesView () {
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
    <section aria-labelledby='files-heading'>
      <h1 id='files-heading' className='visually-hidden'>Toolbox files</h1>

      <KpiCards />
      <SearchBar />

      {error && (
        <Alert variant='danger' role='alert' className='d-flex align-items-center justify-content-between'>
          <span>
            <strong>Error {error.status || ''}:</strong> {error.message}
          </span>
          <Button size='sm' variant='outline-danger' onClick={retry}>Retry</Button>
        </Alert>
      )}

      {loading && <SkeletonTable />}

      {!loading && !error && (
        <>
          <Suspense fallback={<SkeletonTable rows={3} />}>
            <DataQuality />
          </Suspense>
          <Suspense fallback={<SkeletonTable rows={6} />}>
            <FilesTable />
          </Suspense>
        </>
      )}
    </section>
  )
}
