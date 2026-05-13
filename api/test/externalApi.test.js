'use strict'

process.env.NODE_CONFIG_DIR = require('path').join(__dirname, '..', 'config')
process.env.NODE_ENV = 'test'

const { expect } = require('chai')
const nock = require('nock')
const config = require('config')

const externalApi = require('../src/services/externalApi')

const baseUrl = config.get('externalApi.baseUrl')
const token = config.get('externalApi.token')

describe('services/externalApi', () => {
  beforeEach(() => {
    externalApi._resetClient()
    nock.cleanAll()
  })

  after(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  describe('listFiles()', () => {
    it('returns array on 200', async () => {
      nock(baseUrl, { reqheaders: { authorization: `Bearer ${token}` } })
        .get('/v1/secret/files')
        .reply(200, { files: ['a.csv', 'b.csv'] })

      const files = await externalApi.listFiles()
      expect(files).to.deep.equal(['a.csv', 'b.csv'])
    })

    it('throws ExternalApiError with status 404', async () => {
      nock(baseUrl).get('/v1/secret/files').reply(404, { error: 'not found' })

      try {
        await externalApi.listFiles()
        expect.fail('should have thrown')
      } catch (err) {
        expect(err).to.be.instanceOf(externalApi.ExternalApiError)
        expect(err.status).to.equal(404)
      }
    })

    it('throws ExternalApiError with status 500', async () => {
      nock(baseUrl).get('/v1/secret/files').reply(500)
      try {
        await externalApi.listFiles()
        expect.fail('should have thrown')
      } catch (err) {
        expect(err.status).to.equal(500)
      }
    })

    it('throws on timeout', async () => {
      nock(baseUrl).get('/v1/secret/files').delayConnection(2000).reply(200, { files: [] })
      try {
        await externalApi.listFiles()
        expect.fail('should have thrown')
      } catch (err) {
        expect(err).to.be.instanceOf(externalApi.ExternalApiError)
        expect([502, 504]).to.include(err.status)
      }
    }).timeout(5000)

    it('throws when shape is invalid', async () => {
      nock(baseUrl).get('/v1/secret/files').reply(200, { nope: true })
      try {
        await externalApi.listFiles()
        expect.fail('should have thrown')
      } catch (err) {
        expect(err.status).to.equal(502)
      }
    })
  })

  describe('downloadFile()', () => {
    it('returns raw CSV body on 200', async () => {
      const body = 'file,text,number,hex\nfile1.csv,a,1,' + 'a'.repeat(32) + '\n'
      nock(baseUrl, { reqheaders: { authorization: `Bearer ${token}` } })
        .get('/v1/secret/file/file1.csv')
        .reply(200, body, { 'content-type': 'text/csv' })

      const data = await externalApi.downloadFile('file1.csv')
      expect(data).to.equal(body)
    })

    it('throws on 404', async () => {
      nock(baseUrl).get('/v1/secret/file/missing.csv').reply(404)
      try {
        await externalApi.downloadFile('missing.csv')
        expect.fail('should have thrown')
      } catch (err) {
        expect(err).to.be.instanceOf(externalApi.ExternalApiError)
        expect(err.status).to.equal(404)
      }
    })

    it('throws on 500', async () => {
      nock(baseUrl).get('/v1/secret/file/broken.csv').reply(500)
      try {
        await externalApi.downloadFile('broken.csv')
        expect.fail('should have thrown')
      } catch (err) {
        expect(err.status).to.equal(500)
      }
    })

    it('throws on timeout', async () => {
      nock(baseUrl).get('/v1/secret/file/slow.csv').delayConnection(2000).reply(200, 'x')
      try {
        await externalApi.downloadFile('slow.csv')
        expect.fail('should have thrown')
      } catch (err) {
        expect([502, 504]).to.include(err.status)
      }
    }).timeout(5000)

    it('rejects empty file name', async () => {
      try {
        await externalApi.downloadFile('')
        expect.fail('should have thrown')
      } catch (err) {
        expect(err.status).to.equal(400)
      }
    })
  })
})
