import React from 'react'
import { Container, Navbar } from 'react-bootstrap'

import FilesView from './components/FilesView.jsx'

export default function App () {
  return (
    <>
      <Navbar bg='dark' variant='dark' className='mb-4'>
        <Container>
          <Navbar.Brand>Toolbox · Files Viewer</Navbar.Brand>
        </Container>
      </Navbar>
      <Container>
        <FilesView />
      </Container>
    </>
  )
}
