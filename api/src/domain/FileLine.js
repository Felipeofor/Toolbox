'use strict'

const { ValidationError } = require('./errors')
const Hex = require('./Hex')

class FileLine {
  constructor ({ text, number, hex }) {
    if (typeof text !== 'string' || text.length === 0) {
      throw new ValidationError('FileLine.text must be a non-empty string')
    }
    if (!Number.isFinite(number)) {
      throw new ValidationError('FileLine.number must be a finite number')
    }
    if (!(hex instanceof Hex)) {
      throw new ValidationError('FileLine.hex must be a Hex value object')
    }
    this.text = text
    this.number = number
    this.hex = hex
  }

  toJSON () {
    return { text: this.text, number: this.number, hex: this.hex.toString() }
  }
}

module.exports = FileLine
