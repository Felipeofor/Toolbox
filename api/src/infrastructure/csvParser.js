'use strict'

const Hex = require('../domain/Hex')
const FileLine = require('../domain/FileLine')

const EXPECTED_HEADER = ['file', 'text', 'number', 'hex']

function isHeader (cols) {
  return EXPECTED_HEADER.every((h, i) => cols[i] === h)
}

function tryBuildLine (parts, expectedFile) {
  if (parts.length !== 4) return null
  const [file, text, numberRaw, hex] = parts
  if (expectedFile && file !== expectedFile) return null
  const num = Number(numberRaw)
  if (!text || !Number.isFinite(num) || !Hex.isValid(hex)) return null
  try {
    return new FileLine({ text, number: num, hex: new Hex(hex) })
  } catch (_) {
    return null
  }
}

function buildParser ({ logger }) {
  return function parseCsv (content, expectedFileName) {
    if (typeof content !== 'string' || content.length === 0) return []

    const lines = content.split(/\r?\n/)
    if (lines.length === 0) return []

    let startIdx = 0
    const firstCols = lines[0].split(',').map((s) => s.trim().toLowerCase())
    if (isHeader(firstCols)) startIdx = 1

    const result = []
    for (let i = startIdx; i < lines.length; i++) {
      const raw = lines[i]
      if (raw === undefined || raw === '') continue
      const parts = raw.split(',')
      const line = tryBuildLine(parts, expectedFileName)
      if (line === null) {
        logger.debug({ file: expectedFileName, line: i + 1, raw }, 'discarding invalid CSV line')
        continue
      }
      result.push(line)
    }
    return result
  }
}

module.exports = { buildParser }
