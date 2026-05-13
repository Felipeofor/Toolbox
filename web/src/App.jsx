import React from 'react'
import { Container } from 'react-bootstrap'

import FilesView from './components/FilesView.jsx'

export default function App () {
  return (
    <>
      <header className='app-header'>
        <Container>
          <h1 className='m-0'>React Test App</h1>
        </Container>
      </header>
      <Container className='py-4'>
        <FilesView />
      </Container>
    </>
  )
}
