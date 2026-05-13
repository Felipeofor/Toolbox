'use strict'

const { ValidationError } = require('./errors')

const HEX_RE = /^[a-f0-9]{32}$/i

class Hex {
  constructor (value) {
    if (typeof value !== 'string' || !HEX_RE.test(value)) {
      throw new ValidationError(`invalid hex: ${value}`)
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
    return typeof value === 'string' && HEX_RE.test(value)
  }
}

Hex.REGEX = HEX_RE

module.exports = Hex
