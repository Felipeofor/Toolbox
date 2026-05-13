'use strict'

const logger = require('../logger')

const HEX_RE = /^[a-f0-9]{32}$/i
const EXPECTED_HEADER = ['file', 'text', 'number', 'hex']

function isValidRow (parts, expectedFileName) {
  if (parts.length !== 4) return false
  const [file, text, numberRaw, hex] = parts
  if (expectedFileName && file !== expectedFileName) return false
  if (typeof text !== 'string' || text.length === 0) return false
  const num = Number(numberRaw)
  if (!Number.isFinite(num)) return false
  if (!HEX_RE.test(hex)) return false
  return true
}

function parseCsv (content, expectedFileName) {
  if (typeof content !== 'string' || content.length === 0) return []

  const lines = content.split(/\r?\n/)
  if (lines.length === 0) return []

  // Skip header if present (case-insensitive match to expected layout).
  let startIdx = 0
  const headerCols = lines[0].split(',').map((s) => s.trim().toLowerCase())
  if (EXPECTED_HEADER.every((h, i) => headerCols[i] === h)) {
    startIdx = 1
  }

  const result = []
  for (let i = startIdx; i < lines.length; i++) {
    const raw = lines[i]
    if (raw === undefined || raw === '') continue

    const parts = raw.split(',')
    if (!isValidRow(parts, expectedFileName)) {
      logger.debug({ file: expectedFileName, line: i + 1, raw }, 'discarding invalid CSV line')
      continue
    }

    const [, text, numberRaw, hex] = parts
    result.push({
      text,
      number: Number(numberRaw),
      hex
    })
  }

  return result
}

module.exports = {
  parseCsv,
  HEX_RE
}
