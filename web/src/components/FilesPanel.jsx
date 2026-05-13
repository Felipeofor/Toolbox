import React, { useEffect, Suspense, lazy } from 'react'
import { Alert, Button, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

import { fetchFilesData, fetchFilesList } from '../store/filesSlice.js'
import { selectLoading, selectError } from '../store/selectors.js'
import SearchBar from './SearchBar.jsx'
import SkeletonTable from './SkeletonTable.jsx'

const FilesTable = lazy(() => import('./FilesTable.jsx'))

export default function FilesPanel () {
  const dispatch = useDispatch()
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)

  useEffect(() => {
    dispatch(fetchFilesData())
    dispatch(fetchFilesList())
  }, [dispatch])

  function retry () {
    dispatch(fetchFilesData())
  }

  return (
    <section aria-labelledby='files-heading'>
      <h2 id='files-heading' className='visually-hidden'>Files</h2>

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
