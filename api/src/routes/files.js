'use strict'

const express = require('express')

const router = express.Router()

// Routes will be implemented in T06..T08
// Stub to keep the app boot-able during T03.
router.get('/', (req, res) => {
  res.type('application/json; charset=utf-8').json({ message: 'files router' })
})

module.exports = router
