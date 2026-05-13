'use strict'

const { expect } = require('chai')
const Hex = require('../../src/domain/Hex')
const { ValidationError } = require('../../src/domain/errors')

describe('domain/Hex', () => {
  const valid = '70ad29aacf0b690b0467fe2b2767f765'

  it('constructs from a 32-char lowercase hex', () => {
    const h = new Hex(valid)
    expect(h.toString()).to.equal(valid)
    expect(h.toJSON()).to.equal(valid)
  })

  it('accepts uppercase', () => {
    const h = new Hex(valid.toUpperCase())
    expect(h.value).to.equal(valid.toUpperCase())
  })

  it('rejects too-short input', () => {
    expect(() => new Hex('abc')).to.throw(ValidationError)
  })

  it('rejects non-hex chars', () => {
    expect(() => new Hex('z'.repeat(32))).to.throw(ValidationError)
  })

  it('rejects non-string input', () => {
    expect(() => new Hex(null)).to.throw(ValidationError)
    expect(() => new Hex(123)).to.throw(ValidationError)
  })

  it('isValid() static helper matches the same rules', () => {
    expect(Hex.isValid(valid)).to.equal(true)
    expect(Hex.isValid('zzz')).to.equal(false)
    expect(Hex.isValid(null)).to.equal(false)
  })
})
