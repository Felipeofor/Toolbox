import React from 'react'
import { Alert, Container } from 'react-bootstrap'

export default class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError (error) {
    return { error }
  }

  componentDidCatch (error, info) {
    // eslint-disable-next-line no-console
    console.error('UI error boundary caught:', error, info)
  }

  render () {
    if (this.state.error) {
      return (
        <Container className='mt-4'>
          <Alert variant='danger' role='alert'>
            <Alert.Heading>Something went wrong</Alert.Heading>
            <p className='mb-0'>{this.state.error.message || 'Unknown error'}</p>
          </Alert>
        </Container>
      )
    }
    return this.props.children
  }
}
