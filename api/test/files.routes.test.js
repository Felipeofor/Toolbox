'use strict'

process.env.NODE_CONFIG_DIR = require('path').join(__dirname, '..', 'config')
process.env.NODE_ENV = 'test'

const { expect } = require('chai')
const nock = require('nock')
const request = require('supertest')
const config = require('config')

const buildApp = require('../src/app')
const externalApi = require('../src/services/externalApi')

const baseUrl = config.get('externalApi.baseUrl')
const HEX = '70ad29aacf0b690b0467fe2b2767f765'
const HEX2 = 'd33a8ca5d36d3106219f66f939774cf5'
const HEX3 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

function csv (rows) {
  return ['file,text,number,hex', ...rows].join('\n')
}

describe('routes /files', () => {
  let app

  beforeEach(() => {
    externalApi._resetClient()
    nock.cleanAll()
    app = buildApp()
  })

  after(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  describe('GET /files/data', () => {
    it('returns 200 with parsed data for all files', async () => {
      nock(baseUrl).get('/v1/secret/files').reply(200, { files: ['a.csv', 'b.csv'] })
      nock(baseUrl).get('/v1/secret/file/a.csv').reply(200, csv([`a.csv,one,1,${HEX}`]), { 'content-type': 'text/csv' })
      nock(baseUrl).get('/v1/secret/file/b.csv').reply(200, csv([`b.csv,two,2,${HEX2}`]), { 'content-type': 'text/csv' })

      const res = await request(app).get('/files/data')

      expect(res.status).to.equal(200)
      expect(res.headers['content-type']).to.match(/application\/json/)
      expect(res.body).to.deep.equal([
        { file: 'a.csv', lines: [{ text: 'one', number: 1, hex: HEX }] },
        { file: 'b.csv', lines: [{ text: 'two', number: 2, hex: HEX2 }] }
      ])
    })

    it('omits a file whose download fails', async () => {
      nock(baseUrl).get('/v1/secret/files').reply(200, { files: ['a.csv', 'bad.csv'] })
      nock(baseUrl).get('/v1/secret/file/a.csv').reply(200, csv([`a.csv,one,1,${HEX}`]), { 'content-type': 'text/csv' })
      nock(baseUrl).get('/v1/secret/file/bad.csv').reply(500)

      const res = await request(app).get('/files/data')

      expect(res.status).to.equal(200)
      expect(res.body).to.have.lengthOf(1)
      expect(res.body[0].file).to.equal('a.csv')
    })

    it('keeps only valid lines and omits files with zero valid lines', async () => {
      nock(baseUrl).get('/v1/secret/files').reply(200, { files: ['mixed.csv', 'allbad.csv'] })
      nock(baseUrl).get('/v1/secret/file/mixed.csv').reply(200, csv([
        `mixed.csv,ok,1,${HEX}`,
        'mixed.csv,bad,not-a-num,zzz',
        `mixed.csv,ok2,2,${HEX2}`
      ]), { 'content-type': 'text/csv' })
      nock(baseUrl).get('/v1/secret/file/allbad.csv').reply(200, csv([
        'allbad.csv,bad,nope,xxxx'
      ]), { 'content-type': 'text/csv' })

      const res = await request(app).get('/files/data')

      expect(res.status).to.equal(200)
      expect(res.body).to.have.lengthOf(1)
      expect(res.body[0].file).to.equal('mixed.csv')
      expect(res.body[0].lines).to.have.lengthOf(2)
    })

    it('returns 502 when listing the files fails', async () => {
      nock(baseUrl).get('/v1/secret/files').reply(500)

      const res = await request(app).get('/files/data')
      expect(res.status).to.equal(500)
      expect(res.body.error).to.equal('failed to retrieve files data')
    })

    it('returns 200 with empty array when no files are listed', async () => {
      nock(baseUrl).get('/v1/secret/files').reply(200, { files: [] })

      const res = await request(app).get('/files/data')
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal([])
    })

    describe('?fileName=', () => {
      it('returns 200 with only that file when valid', async () => {
        nock(baseUrl).get('/v1/secret/files').reply(200, { files: ['a.csv', 'b.csv'] })
        nock(baseUrl).get('/v1/secret/file/a.csv').reply(200, csv([`a.csv,one,1,${HEX3}`]), { 'content-type': 'text/csv' })

        const res = await request(app).get('/files/data?fileName=a.csv')
        expect(res.status).to.equal(200)
        expect(res.body).to.have.lengthOf(1)
        expect(res.body[0].file).to.equal('a.csv')
      })

      it('returns 404 when the file is not in the external listing', async () => {
        nock(baseUrl).get('/v1/secret/files').reply(200, { files: ['a.csv'] })

        const res = await request(app).get('/files/data?fileName=missing.csv')
        expect(res.status).to.equal(404)
        expect(res.body.error).to.match(/not found/)
      })

      it('returns 400 when the param is empty', async () => {
        const res = await request(app).get('/files/data?fileName=')
        expect(res.status).to.equal(400)
      })
    })
  })

  describe('GET /files/list', () => {
    it('returns the external listing verbatim', async () => {
      nock(baseUrl).get('/v1/secret/files').reply(200, { files: ['a.csv', 'b.csv'] })

      const res = await request(app).get('/files/list')
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({ files: ['a.csv', 'b.csv'] })
    })

    it('propagates upstream failures with 502', async () => {
      nock(baseUrl).get('/v1/secret/files').reply(503)

      const res = await request(app).get('/files/list')
      expect(res.status).to.equal(503)
      expect(res.body.error).to.equal('failed to retrieve files list')
    })
  })

  describe('GET /health', () => {
    it('returns 200 ok', async () => {
      const res = await request(app).get('/health')
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({ status: 'ok' })
    })
  })
})
