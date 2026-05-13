'use strict'

const { expect } = require('chai')
const FileLine = require('../../src/domain/FileLine')
const Hex = require('../../src/domain/Hex')
const { ValidationError } = require('../../src/domain/errors')

const HEX = '70ad29aacf0b690b0467fe2b2767f765'

describe('domain/FileLine', () => {
  it('builds with valid fields', () => {
    const line = new FileLine({ text: 'abc', number: 7, hex: new Hex(HEX) })
    expect(line.toJSON()).to.deep.equal({ text: 'abc', number: 7, hex: HEX })
  })

  it('rejects empty text', () => {
    expect(() => new FileLine({ text: '', number: 1, hex: new Hex(HEX) })).to.throw(ValidationError)
  })

  it('rejects non-finite numbers', () => {
    expect(() => new FileLine({ text: 'x', number: NaN, hex: new Hex(HEX) })).to.throw(ValidationError)
    expect(() => new FileLine({ text: 'x', number: Infinity, hex: new Hex(HEX) })).to.throw(ValidationError)
  })

  it('rejects raw hex string (must be a Hex value object)', () => {
    expect(() => new FileLine({ text: 'x', number: 1, hex: HEX })).to.throw(ValidationError)
  })
})
