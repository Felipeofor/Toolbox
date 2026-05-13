'use strict'

const express = require('express')

function buildHealthRouter ({ readinessProbe }) {
  const router = express.Router()

  router.get('/health', (_req, res) => {
    res.type('application/json; charset=utf-8').json({ status: 'ok' })
  })

  router.get('/ready', async (_req, res) => {
    try {
      const ready = await readinessProbe()
      if (ready) {
        return res.type('application/json; charset=utf-8').json({ status: 'ready' })
      }
      return res.status(503).type('application/json; charset=utf-8').json({ status: 'not_ready' })
    } catch (err) {
      return res.status(503).type('application/json; charset=utf-8').json({ status: 'not_ready', error: err.message })
    }
  })

  return router
}

module.exports = { buildHealthRouter }
