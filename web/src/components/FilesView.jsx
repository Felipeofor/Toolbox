import React, { useEffect } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

import SearchBar from './SearchBar.jsx'
import FilesTable from './FilesTable.jsx'
import { fetchFilesData, fetchFilesList } from '../store/filesSlice.js'

export default function FilesView () {
  const dispatch = useDispatch()
  const { data, loading, error } = useSelector((s) => s.files)

  useEffect(() => {
    dispatch(fetchFilesData())
    dispatch(fetchFilesList())
  }, [dispatch])

  return (
    <div>
      <SearchBar />

      {loading && (
        <div className='d-flex align-items-center gap-2 mb-3' role='status'>
          <Spinner animation='border' size='sm' />
          <span>Loading…</span>
        </div>
      )}

      {error && (
        <Alert variant='danger'>
          <strong>Error {error.status || ''}:</strong> {error.message}
        </Alert>
      )}

      {!loading && !error && <FilesTable data={data} />}
    </div>
  )
}
