'use strict'

process.env.NODE_CONFIG_DIR = require('path').join(__dirname, '..', 'config')
process.env.NODE_ENV = 'test'

const { expect } = require('chai')

const { parseCsv } = require('../src/services/csvParser')

const HEX = '70ad29aacf0b690b0467fe2b2767f765'
const HEX2 = 'd33a8ca5d36d3106219f66f939774cf5'

describe('services/csvParser', () => {
  it('returns [] for empty string', () => {
    expect(parseCsv('', 'file1.csv')).to.deep.equal([])
  })

  it('returns [] for non-string input', () => {
    expect(parseCsv(null, 'file1.csv')).to.deep.equal([])
    expect(parseCsv(undefined, 'file1.csv')).to.deep.equal([])
  })

  it('returns [] when only the header is present', () => {
    const csv = 'file,text,number,hex\n'
    expect(parseCsv(csv, 'file1.csv')).to.deep.equal([])
  })

  it('parses valid rows', () => {
    const csv = `file,text,number,hex\nfile1.csv,abc,42,${HEX}\nfile1.csv,xyz,-7,${HEX2}`
    const rows = parseCsv(csv, 'file1.csv')
    expect(rows).to.deep.equal([
      { text: 'abc', number: 42, hex: HEX },
      { text: 'xyz', number: -7, hex: HEX2 }
    ])
  })

  it('discards rows with missing columns', () => {
    const csv = `file,text,number,hex\nfile1.csv,abc,42\nfile1.csv,abc,42,${HEX}`
    const rows = parseCsv(csv, 'file1.csv')
    expect(rows).to.have.lengthOf(1)
    expect(rows[0].text).to.equal('abc')
  })

  it('discards rows with extra columns', () => {
    const csv = `file,text,number,hex\nfile1.csv,abc,42,${HEX},extra`
    expect(parseCsv(csv, 'file1.csv')).to.deep.equal([])
  })

  it('discards rows with non-numeric number', () => {
    const csv = `file,text,number,hex\nfile1.csv,abc,not_a_num,${HEX}`
    expect(parseCsv(csv, 'file1.csv')).to.deep.equal([])
  })

  it('discards rows with invalid hex (too short)', () => {
    const csv = 'file,text,number,hex\nfile1.csv,abc,42,abc123'
    expect(parseCsv(csv, 'file1.csv')).to.deep.equal([])
  })

  it('discards rows with invalid hex (non-hex chars)', () => {
    const csv = 'file,text,number,hex\nfile1.csv,abc,42,zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'
    expect(parseCsv(csv, 'file1.csv')).to.deep.equal([])
  })

  it('accepts uppercase hex', () => {
    const upper = HEX.toUpperCase()
    const csv = `file,text,number,hex\nfile1.csv,abc,42,${upper}`
    const rows = parseCsv(csv, 'file1.csv')
    expect(rows[0].hex).to.equal(upper)
  })

  it('discards rows where the file column does not match expectedFileName', () => {
    const csv = `file,text,number,hex\nother.csv,abc,42,${HEX}`
    expect(parseCsv(csv, 'file1.csv')).to.deep.equal([])
  })

  it('parses without filtering when expectedFileName is omitted', () => {
    const csv = `file,text,number,hex\nany.csv,abc,42,${HEX}`
    const rows = parseCsv(csv)
    expect(rows).to.have.lengthOf(1)
  })

  it('handles CRLF line endings', () => {
    const csv = `file,text,number,hex\r\nfile1.csv,abc,42,${HEX}\r\n`
    expect(parseCsv(csv, 'file1.csv')).to.have.lengthOf(1)
  })

  it('handles mixed valid and invalid rows', () => {
    const csv = [
      'file,text,number,hex',
      `file1.csv,ok,1,${HEX}`,
      'file1.csv,bad,nope,zzzz',
      `file1.csv,ok2,2,${HEX2}`,
      'incomplete,row',
      ''
    ].join('\n')
    const rows = parseCsv(csv, 'file1.csv')
    expect(rows).to.deep.equal([
      { text: 'ok', number: 1, hex: HEX },
      { text: 'ok2', number: 2, hex: HEX2 }
    ])
  })

  it('discards rows with empty text', () => {
    const csv = `file,text,number,hex\nfile1.csv,,42,${HEX}`
    expect(parseCsv(csv, 'file1.csv')).to.deep.equal([])
  })
})
