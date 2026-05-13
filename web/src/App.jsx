import React from 'react'
import { Container } from 'react-bootstrap'

import MainTabs from './components/MainTabs.jsx'
import StatusPill from './components/StatusPill.jsx'

export default function App () {
  return (
    <>
      <header className='app-header'>
        <Container className='d-flex align-items-center justify-content-between gap-3 flex-wrap'>
          <h1 className='m-0'>React Test App</h1>
          <StatusPill />
        </Container>
      </header>
      <MainTabs />
    </>
  )
}
