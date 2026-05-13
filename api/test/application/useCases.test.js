'use strict'

const { expect } = require('chai')

const Hex = require('../../src/domain/Hex')
const FileLine = require('../../src/domain/FileLine')
const { buildGetAllFilesData } = require('../../src/application/files/getAllFilesData')
const { buildGetFileData } = require('../../src/application/files/getFileData')
const { buildListFiles } = require('../../src/application/files/listFiles')
const { NotFoundError, ValidationError } = require('../../src/domain/errors')

const HEX = '70ad29aacf0b690b0467fe2b2767f765'

const silentLogger = { debug () {}, info () {}, warn () {}, error () {} }

function fakeSource (overrides) {
  return Object.assign({
    listFiles: async () => [],
    downloadFile: async () => ''
  }, overrides)
}

function fakeParser (linesPerFile) {
  return (_content, fileName) => (linesPerFile[fileName] || []).map(
    (l) => new FileLine({ text: l.text, number: l.number, hex: new Hex(l.hex) })
  )
}

describe('application use cases', () => {
  describe('listFiles', () => {
    it('returns {files: [...]}', async () => {
      const listFiles = buildListFiles({
        fileSource: fakeSource({ listFiles: async () => ['a.csv'] })
      })
      expect(await listFiles()).to.deep.equal({ files: ['a.csv'] })
    })
  })

  describe('getAllFilesData', () => {
    it('aggregates results per file', async () => {
      const source = fakeSource({
        listFiles: async () => ['a.csv', 'b.csv'],
        downloadFile: async () => 'irrelevant — parser is faked'
      })
      const parseCsv = fakeParser({
        'a.csv': [{ text: 'x', number: 1, hex: HEX }],
        'b.csv': [{ text: 'y', number: 2, hex: HEX }]
      })
      const useCase = buildGetAllFilesData({ fileSource: source, parseCsv, logger: silentLogger })
      const out = (await useCase()).map((e) => e.toJSON())
      expect(out).to.deep.equal([
        { file: 'a.csv', lines: [{ text: 'x', number: 1, hex: HEX }] },
        { file: 'b.csv', lines: [{ text: 'y', number: 2, hex: HEX }] }
      ])
    })

    it('omits files whose download fails', async () => {
      const source = fakeSource({
        listFiles: async () => ['ok.csv', 'bad.csv'],
        downloadFile: async (name) => {
          if (name === 'bad.csv') throw Object.assign(new Error('boom'), { status: 500 })
          return ''
        }
      })
      const parseCsv = fakeParser({ 'ok.csv': [{ text: 'x', number: 1, hex: HEX }] })
      const useCase = buildGetAllFilesData({ fileSource: source, parseCsv, logger: silentLogger })
      const out = (await useCase()).map((e) => e.toJSON())
      expect(out).to.have.lengthOf(1)
      expect(out[0].file).to.equal('ok.csv')
    })

    it('omits files with zero valid lines', async () => {
      const source = fakeSource({
        listFiles: async () => ['a.csv'],
        downloadFile: async () => ''
      })
      const parseCsv = fakeParser({ 'a.csv': [] })
      const useCase = buildGetAllFilesData({ fileSource: source, parseCsv, logger: silentLogger })
      expect(await useCase()).to.deep.equal([])
    })
  })

  describe('getFileData', () => {
    it('throws NotFoundError when file is missing in listing', async () => {
      const source = fakeSource({ listFiles: async () => ['a.csv'] })
      const useCase = buildGetFileData({ fileSource: source, parseCsv: fakeParser({}), logger: silentLogger })
      try { await useCase('missing.csv'); throw new Error('should throw') } catch (err) {
        expect(err).to.be.instanceOf(NotFoundError)
      }
    })

    it('throws ValidationError on invalid names (path traversal)', async () => {
      const useCase = buildGetFileData({
        fileSource: fakeSource({ listFiles: async () => [] }),
        parseCsv: fakeParser({}),
        logger: silentLogger
      })
      try { await useCase('../etc/passwd'); throw new Error('should throw') } catch (err) {
        expect(err).to.be.instanceOf(ValidationError)
      }
    })

    it('returns a single-entry array on success', async () => {
      const source = fakeSource({
        listFiles: async () => ['a.csv'],
        downloadFile: async () => ''
      })
      const parseCsv = fakeParser({ 'a.csv': [{ text: 'x', number: 1, hex: HEX }] })
      const useCase = buildGetFileData({ fileSource: source, parseCsv, logger: silentLogger })
      const out = await useCase('a.csv')
      expect(out.map((e) => e.toJSON())).to.deep.equal([
        { file: 'a.csv', lines: [{ text: 'x', number: 1, hex: HEX }] }
      ])
    })
  })
})
