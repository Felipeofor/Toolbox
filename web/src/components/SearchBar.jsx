import React, { useState } from 'react'
import { Form, Button, InputGroup, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

import { fetchFilesData, fetchFilesList, setFilter, clearFilter } from '../store/filesSlice.js'
import { selectList, selectFilter } from '../store/selectors.js'

export default function SearchBar () {
  const dispatch = useDispatch()
  const list = useSelector(selectList)
  const filter = useSelector(selectFilter)
  const [value, setValue] = useState(filter)

  function onSubmit (e) {
    e.preventDefault()
    const trimmed = value.trim()
    dispatch(setFilter(trimmed))
    dispatch(fetchFilesData(trimmed || undefined))
  }

  function onClear () {
    setValue('')
    dispatch(clearFilter())
    dispatch(fetchFilesData())
  }

  function onRefreshList () {
    dispatch(fetchFilesList())
  }

  return (
    <Form onSubmit={onSubmit} className='mb-3' role='search' aria-label='Filter files'>
      <Row className='g-2 align-items-center'>
        <Col xs={12} md={6}>
          <Form.Label htmlFor='fileName-input' className='visually-hidden'>
            File name
          </Form.Label>
          <InputGroup>
            <Form.Control
              id='fileName-input'
              type='text'
              list='files-list'
              placeholder='Filter by fileName (e.g. file1.csv)'
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-label='Filter by fileName'
            />
            <Button type='submit' variant='primary'>Search</Button>
            <Button type='button' variant='outline-secondary' onClick={onClear}>Clear</Button>
          </InputGroup>
          <datalist id='files-list'>
            {list.map((f) => <option key={f} value={f} />)}
          </datalist>
        </Col>
        <Col xs={12} md='auto'>
          <Button type='button' variant='link' size='sm' onClick={onRefreshList}>
            Refresh file list
          </Button>
        </Col>
      </Row>
    </Form>
  )
}
