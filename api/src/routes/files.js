'use strict'

const express = require('express')

const filesService = require('../services/filesService')
const externalApi = require('../services/externalApi')
const logger = require('../logger')

const router = express.Router()

function jsonHeader (res) {
  res.type('application/json; charset=utf-8')
}

router.get('/data', async (req, res) => {
  jsonHeader(res)
  const rawFileName = req.query.fileName

  try {
    if (rawFileName !== undefined) {
      if (typeof rawFileName !== 'string' || rawFileName.trim() === '') {
        return res.status(400).json({ error: 'fileName query param must be a non-empty string' })
      }
      const data = await filesService.getFileData(rawFileName)
      return res.status(200).json(data)
    }
    const data = await filesService.getAllFilesData()
    return res.status(200).json(data)
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: err.message })
    }
    logger.error({ err: err.message, status: err.status }, 'GET /files/data failed')
    const status = typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 502
    return res.status(status).json({ error: 'failed to retrieve files data' })
  }
})

router.get('/list', async (req, res) => {
  jsonHeader(res)
  try {
    const files = await externalApi.listFiles()
    return res.status(200).json({ files })
  } catch (err) {
    logger.error({ err: err.message, status: err.status }, 'GET /files/list failed')
    const status = typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 502
    return res.status(status).json({ error: 'failed to retrieve files list' })
  }
})

module.exports = router
