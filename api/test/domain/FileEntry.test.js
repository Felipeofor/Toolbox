'use strict'

const { expect } = require('chai')
const FileEntry = require('../../src/domain/FileEntry')
const FileName = require('../../src/domain/FileName')
const FileLine = require('../../src/domain/FileLine')
const Hex = require('../../src/domain/Hex')

const HEX = '70ad29aacf0b690b0467fe2b2767f765'

describe('domain/FileEntry', () => {
  it('builds with valid file + lines', () => {
    const entry = new FileEntry(
      new FileName('a.csv'),
      [new FileLine({ text: 'x', number: 1, hex: new Hex(HEX) })]
    )
    expect(entry.isEmpty()).to.equal(false)
    expect(entry.toJSON()).to.deep.equal({
      file: 'a.csv',
      lines: [{ text: 'x', number: 1, hex: HEX }]
    })
  })

  it('reports empty for zero lines', () => {
    expect(new FileEntry(new FileName('a.csv'), []).isEmpty()).to.equal(true)
  })

  it('rejects non-FileName as file', () => {
    expect(() => new FileEntry('a.csv', [])).to.throw(TypeError)
  })

  it('rejects mixed line types', () => {
    expect(() => new FileEntry(new FileName('a.csv'), [{ text: 'x' }])).to.throw(TypeError)
  })
})
