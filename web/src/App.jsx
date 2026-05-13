import React from 'react'
import { Container } from 'react-bootstrap'

import FilesView from './components/FilesView.jsx'
import StatusPill from './components/StatusPill.jsx'

export default function App () {
  return (
    <>
      <header className='app-header'>
        <Container className='d-flex align-items-center justify-content-between'>
          <h1 className='m-0'>React Test App</h1>
          <StatusPill />
        </Container>
      </header>
      <Container className='py-4'>
        <FilesView />
      </Container>
    </>
  )
}
