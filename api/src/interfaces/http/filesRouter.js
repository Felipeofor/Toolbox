'use strict'

const express = require('express')

const { validateFileNameQuery } = require('./middleware/validateFileName')

function buildFilesRouter ({ useCases }) {
  const router = express.Router()

  router.get('/data', validateFileNameQuery, async (req, res, next) => {
    try {
      if (req.validatedFileName) {
        const entries = await useCases.getFileData(req.validatedFileName)
        return res.status(200).type('application/json; charset=utf-8').json(entries)
      }
      const entries = await useCases.getAllFilesData()
      return res.status(200).type('application/json; charset=utf-8').json(entries)
    } catch (err) {
      return next(err)
    }
  })

  router.get('/list', async (_req, res, next) => {
    try {
      const result = await useCases.listFiles()
      return res.status(200).type('application/json; charset=utf-8').json(result)
    } catch (err) {
      return next(err)
    }
  })

  return router
}

module.exports = { buildFilesRouter }
