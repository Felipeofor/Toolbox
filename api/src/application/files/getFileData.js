'use strict'

const FileName = require('../../domain/FileName')
const FileEntry = require('../../domain/FileEntry')
const { NotFoundError } = require('../../domain/errors')

function buildGetFileData ({ fileSource, parseCsv, logger }) {
  return async function getFileData (rawName) {
    const fileName = new FileName(rawName)
    const available = await fileSource.listFiles()
    if (!available.includes(fileName.toString())) {
      throw new NotFoundError(`file not found: ${fileName}`)
    }
    try {
      const content = await fileSource.downloadFile(fileName.toString())
      const lines = parseCsv(content, fileName.toString())
      const entry = new FileEntry(fileName, lines)
      return entry.isEmpty() ? [] : [entry]
    } catch (err) {
      logger.warn({ file: fileName.toString(), err: err.message, status: err.status }, 'file processing failed')
      return []
    }
  }
}

module.exports = { buildGetFileData }
