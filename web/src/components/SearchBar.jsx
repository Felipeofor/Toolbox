import React, { useState } from 'react'
import { Form, Button, InputGroup, Row, Col, Collapse } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

import {
  fetchFilesData,
  fetchFilesList,
  fetchFilesStats,
  setFilter,
  clearFilter,
  setSearch,
  clearSearch
} from '../store/filesSlice.js'
import { selectList, selectFilter, selectSearch } from '../store/selectors.js'

export default function SearchBar () {
  const dispatch = useDispatch()
  const list = useSelector(selectList)
  const filter = useSelector(selectFilter)
  const search = useSelector(selectSearch)
  const [exactValue, setExactValue] = useState(filter)
  const [showAdvanced, setShowAdvanced] = useState(false)

  function onSearchChange (e) {
    dispatch(setSearch(e.target.value))
  }

  function onSearchClear () {
    dispatch(clearSearch())
  }

  function onExactSubmit (e) {
    e.preventDefault()
    const trimmed = exactValue.trim()
    dispatch(setFilter(trimmed))
    dispatch(fetchFilesData(trimmed || undefined))
  }

  function onExactClear () {
    setExactValue('')
    dispatch(clearFilter())
    dispatch(fetchFilesData())
  }

  function onRefreshAll () {
    dispatch(fetchFilesList())
    dispatch(fetchFilesData())
    dispatch(fetchFilesStats())
  }

  return (
    <div className='mb-3'>
      <Row className='g-2 align-items-center'>
        <Col xs={12} md>
          <Form.Label htmlFor='search-input' className='visually-hidden'>
            Search across rows
          </Form.Label>
          <InputGroup>
            <InputGroup.Text>🔎</InputGroup.Text>
            <Form.Control
              id='search-input'
              type='search'
              placeholder='Search any text, hex or number across all rows…'
              value={search}
              onChange={onSearchChange}
              aria-label='Search across rows (client-side)'
            />
            {search && (
              <Button variant='outline-secondary' onClick={onSearchClear}>Clear</Button>
            )}
          </InputGroup>
        </Col>
        <Col xs='auto'>
          <Button
            variant='outline-secondary'
            size='sm'
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
            aria-controls='advanced-panel'
          >
            {showAdvanced ? 'Hide' : 'Advanced'}
          </Button>
        </Col>
        <Col xs='auto'>
          <Button variant='link' size='sm' onClick={onRefreshAll}>Refresh all</Button>
        </Col>
      </Row>

      <Collapse in={showAdvanced}>
        <div id='advanced-panel' className='mt-3 p-3 border rounded bg-light'>
          <Form onSubmit={onExactSubmit} role='search' aria-label='Server-side exact filter'>
            <Form.Label htmlFor='fileName-input' className='small text-muted'>
              Exact server-side filter (calls <code>/files/data?fileName=</code>)
            </Form.Label>
            <Row className='g-2'>
              <Col xs={12} md={6}>
                <InputGroup>
                  <Form.Control
                    id='fileName-input'
                    type='text'
                    list='files-list'
                    placeholder='e.g. test2.csv'
                    value={exactValue}
                    onChange={(e) => setExactValue(e.target.value)}
                    aria-label='Exact fileName'
                  />
                  <Button type='submit' variant='primary'>Apply</Button>
                  <Button type='button' variant='outline-secondary' onClick={onExactClear}>Clear</Button>
                </InputGroup>
                <datalist id='files-list'>
                  {list.map((f) => <option key={f} value={f} />)}
                </datalist>
              </Col>
            </Row>
          </Form>
        </div>
      </Collapse>
    </div>
  )
}
