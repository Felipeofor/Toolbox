import React, { useEffect, useState } from 'react'
import { Badge } from 'react-bootstrap'

import { getReady } from '../api/client.js'

const POLL_MS = 15000

export default function StatusPill () {
  const [state, setState] = useState({ status: 'checking', error: null })

  useEffect(() => {
    let cancelled = false

    async function probe () {
      try {
        const res = await getReady()
        if (!cancelled) setState({ status: res.status || 'ready', error: null })
      } catch (err) {
        if (!cancelled) setState({ status: 'down', error: err.message })
      }
    }

    probe()
    const id = setInterval(probe, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const variant =
    state.status === 'ready'
      ? 'success'
      : state.status === 'checking'
        ? 'secondary'
        : 'danger'

  const label =
    state.status === 'ready'
      ? 'API ready'
      : state.status === 'checking'
        ? 'Checking…'
        : 'API down'

  return (
    <Badge bg={variant} role='status' aria-live='polite' title={state.error || ''}>
      ● {label}
    </Badge>
  )
}
