import React, { useEffect, Suspense, lazy } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

import { fetchFilesData, fetchFilesList } from '../store/filesSlice.js'
import { selectLoading, selectError } from '../store/selectors.js'
import SearchBar from './SearchBar.jsx'

const FilesTable = lazy(() => import('./FilesTable.jsx'))

export default function FilesView () {
  const dispatch = useDispatch()
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)

  useEffect(() => {
    dispatch(fetchFilesData())
    dispatch(fetchFilesList())
  }, [dispatch])

  return (
    <section aria-labelledby='files-heading'>
      <h1 id='files-heading' className='visually-hidden'>Toolbox files</h1>
      <SearchBar />

      {loading && (
        <div className='d-flex align-items-center gap-2 mb-3' role='status' aria-live='polite'>
          <Spinner animation='border' size='sm' aria-hidden='true' />
          <span>Loading…</span>
        </div>
      )}

      {error && (
        <Alert variant='danger' role='alert'>
          <strong>Error {error.status || ''}:</strong> {error.message}
        </Alert>
      )}

      {!loading && !error && (
        <Suspense fallback={<Spinner animation='border' size='sm' aria-label='Loading table' />}>
          <FilesTable />
        </Suspense>
      )}
    </section>
  )
}
