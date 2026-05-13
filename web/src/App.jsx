import React from 'react'
import { Container } from 'react-bootstrap'

import FilesView from './components/FilesView.jsx'
import StatusPill from './components/StatusPill.jsx'
import ViewModeSwitch from './components/ViewModeSwitch.jsx'

export default function App () {
  return (
    <>
      <header className='app-header'>
        <Container className='d-flex align-items-center justify-content-between gap-3 flex-wrap'>
          <h1 className='m-0'>React Test App</h1>
          <div className='d-flex align-items-center gap-3'>
            <ViewModeSwitch />
            <StatusPill />
          </div>
        </Container>
      </header>
      <Container className='py-4'>
        <FilesView />
      </Container>
    </>
  )
}
