'use strict'

const { ValidationError } = require('./errors')

const FILENAME_RE = /^[A-Za-z0-9._-]+$/

class FileName {
  constructor (value) {
    if (typeof value !== 'string' || value.length === 0 || value.length > 255 || !FILENAME_RE.test(value)) {
      throw new ValidationError(`invalid fileName: ${value}`)
    }
    this.value = value
  }

  toString () {
    return this.value
  }

  toJSON () {
    return this.value
  }

  static isValid (value) {
    return typeof value === 'string' && value.length > 0 && value.length <= 255 && FILENAME_RE.test(value)
  }
}

FileName.REGEX = FILENAME_RE

module.exports = FileName
