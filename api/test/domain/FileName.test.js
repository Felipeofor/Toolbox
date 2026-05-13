'use strict'

const { expect } = require('chai')
const FileName = require('../../src/domain/FileName')
const { ValidationError } = require('../../src/domain/errors')

describe('domain/FileName', () => {
  it('accepts simple names', () => {
    expect(new FileName('file1.csv').toString()).to.equal('file1.csv')
    expect(new FileName('data_2024-05.csv').toString()).to.equal('data_2024-05.csv')
  })

  it('rejects empty strings', () => {
    expect(() => new FileName('')).to.throw(ValidationError)
  })

  it('rejects path separators and unusual chars', () => {
    expect(() => new FileName('../etc/passwd')).to.throw(ValidationError)
    expect(() => new FileName('a/b.csv')).to.throw(ValidationError)
    expect(() => new FileName('a b.csv')).to.throw(ValidationError)
  })

  it('rejects names longer than 255 chars', () => {
    expect(() => new FileName('a'.repeat(256))).to.throw(ValidationError)
  })

  it('isValid() helper matches the same rules', () => {
    expect(FileName.isValid('file1.csv')).to.equal(true)
    expect(FileName.isValid('')).to.equal(false)
    expect(FileName.isValid('../x')).to.equal(false)
  })
})
