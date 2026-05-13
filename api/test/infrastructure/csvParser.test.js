'use strict'

const { expect } = require('chai')
const { buildParser } = require('../../src/infrastructure/csvParser')

const silentLogger = { debug () {}, info () {}, warn () {}, error () {} }
const parseCsv = buildParser({ logger: silentLogger })

const HEX = '70ad29aacf0b690b0467fe2b2767f765'
const HEX2 = 'd33a8ca5d36d3106219f66f939774cf5'

describe('infrastructure/csvParser', () => {
  it('returns [] for empty string', () => {
    expect(parseCsv('', 'file1.csv')).to.deep.equal([])
  })

  it('returns [] for non-string input', () => {
    expect(parseCsv(null, 'file1.csv')).to.deep.equal([])
  })

  it('returns [] when only the header is present', () => {
    expect(parseCsv('file,text,number,hex\n', 'file1.csv')).to.deep.equal([])
  })

  it('parses valid rows into FileLine instances', () => {
    const csv = `file,text,number,hex\nfile1.csv,abc,42,${HEX}\nfile1.csv,xyz,-7,${HEX2}`
    const rows = parseCsv(csv, 'file1.csv').map((l) => l.toJSON())
    expect(rows).to.deep.equal([
      { text: 'abc', number: 42, hex: HEX },
      { text: 'xyz', number: -7, hex: HEX2 }
    ])
  })

  it('discards rows with missing or extra columns', () => {
    const csv = `file,text,number,hex\nfile1.csv,abc,42\nfile1.csv,abc,42,${HEX},extra\nfile1.csv,ok,1,${HEX}`
    const rows = parseCsv(csv, 'file1.csv')
    expect(rows.length).to.equal(1)
  })

  it('discards rows with non-numeric number', () => {
    const csv = `file,text,number,hex\nfile1.csv,abc,xx,${HEX}`
    expect(parseCsv(csv, 'file1.csv')).to.deep.equal([])
  })

  it('discards rows with invalid hex', () => {
    const csv = 'file,text,number,hex\nfile1.csv,abc,42,abc123'
    expect(parseCsv(csv, 'file1.csv')).to.deep.equal([])
  })

  it('discards rows where file does not match expectedFileName', () => {
    const csv = `file,text,number,hex\nother.csv,abc,42,${HEX}`
    expect(parseCsv(csv, 'file1.csv')).to.deep.equal([])
  })

  it('discards rows with empty text', () => {
    const csv = `file,text,number,hex\nfile1.csv,,42,${HEX}`
    expect(parseCsv(csv, 'file1.csv')).to.deep.equal([])
  })

  it('handles CRLF line endings', () => {
    const csv = `file,text,number,hex\r\nfile1.csv,abc,42,${HEX}\r\n`
    expect(parseCsv(csv, 'file1.csv').length).to.equal(1)
  })

  it('mixed valid/invalid rows produce only valid output', () => {
    const csv = [
      'file,text,number,hex',
      `file1.csv,ok,1,${HEX}`,
      'file1.csv,bad,nope,zzz',
      `file1.csv,ok2,2,${HEX2}`,
      'incomplete,row',
      ''
    ].join('\n')
    const rows = parseCsv(csv, 'file1.csv').map((l) => l.toJSON())
    expect(rows).to.deep.equal([
      { text: 'ok', number: 1, hex: HEX },
      { text: 'ok2', number: 2, hex: HEX2 }
    ])
  })
})
