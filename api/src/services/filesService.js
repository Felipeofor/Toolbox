'use strict'

const config = require('config')

const externalApi = require('./externalApi')
const { parseCsv } = require('./csvParser')
const logger = require('../logger')

async function processFile (name) {
  try {
    const content = await externalApi.downloadFile(name)
    const lines = parseCsv(content, name)
    return { file: name, lines }
  } catch (err) {
    logger.warn({ file: name, err: err.message, status: err.status }, 'file processing failed')
    return null
  }
}

async function getAllFilesData () {
  const files = await externalApi.listFiles()
  const concurrency = config.has('externalApi.downloadConcurrency')
    ? config.get('externalApi.downloadConcurrency')
    : 5

  const results = []
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency)
    const settled = await Promise.allSettled(batch.map(processFile))
    for (const r of settled) {
      if (r.status === 'fulfilled' && r.value && r.value.lines.length > 0) {
        results.push(r.value)
      }
    }
  }
  return results
}

async function getFileData (name) {
  const files = await externalApi.listFiles()
  if (!files.includes(name)) {
    const err = new Error(`file not found: ${name}`)
    err.status = 404
    throw err
  }
  const result = await processFile(name)
  if (!result || result.lines.length === 0) return []
  return [result]
}

module.exports = {
  getAllFilesData,
  getFileData,
  processFile
}
