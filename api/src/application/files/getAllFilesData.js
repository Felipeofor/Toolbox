'use strict'

const FileName = require('../../domain/FileName')
const FileEntry = require('../../domain/FileEntry')

function buildGetAllFilesData ({ fileSource, parseCsv, logger, concurrency = 5 }) {
  async function processOne (name) {
    try {
      const fileName = new FileName(name)
      const content = await fileSource.downloadFile(name)
      const lines = parseCsv(content, name)
      return new FileEntry(fileName, lines)
    } catch (err) {
      logger.warn({ file: name, err: err.message, status: err.status }, 'file processing failed')
      return null
    }
  }

  return async function getAllFilesData () {
    const files = await fileSource.listFiles()
    const result = []
    for (let i = 0; i < files.length; i += concurrency) {
      const batch = files.slice(i, i + concurrency)
      const settled = await Promise.allSettled(batch.map(processOne))
      for (const r of settled) {
        if (r.status === 'fulfilled' && r.value && !r.value.isEmpty()) {
          result.push(r.value)
        }
      }
    }
    return result
  }
}

module.exports = { buildGetAllFilesData }
