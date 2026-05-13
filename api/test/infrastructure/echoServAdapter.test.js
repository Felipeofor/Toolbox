'use strict'

const { expect } = require('chai')
const nock = require('nock')
const { buildEchoServAdapter } = require('../../src/infrastructure/echoServAdapter')
const { UpstreamError } = require('../../src/domain/errors')

const config = {
  externalApi: {
    baseUrl: 'https://echo-serv.tbxnet.com',
    token: 'aSuperSecretKey',
    timeoutMs: 800
  }
}
const silentLogger = { debug () {}, info () {}, warn () {}, error () {} }

function newAdapter () {
  return buildEchoServAdapter({ config, logger: silentLogger })
}

describe('infrastructure/echoServAdapter', () => {
  beforeEach(() => nock.cleanAll())
  after(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  describe('listFiles()', () => {
    it('returns the array on 200', async () => {
      nock(config.externalApi.baseUrl, {
        reqheaders: { authorization: `Bearer ${config.externalApi.token}` }
      })
        .get('/v1/secret/files')
        .reply(200, { files: ['a.csv', 'b.csv'] })
      const adapter = newAdapter()
      const out = await adapter.listFiles()
      expect(out).to.deep.equal(['a.csv', 'b.csv'])
    })

    it('throws UpstreamError on HTTP 404', async () => {
      nock(config.externalApi.baseUrl).get('/v1/secret/files').reply(404)
      try { await newAdapter().listFiles(); throw new Error('should have thrown') } catch (err) {
        expect(err).to.be.instanceOf(UpstreamError)
        expect(err.status).to.equal(404)
      }
    })

    it('throws UpstreamError on timeout (504)', async () => {
      nock(config.externalApi.baseUrl).get('/v1/secret/files').delayConnection(2000).reply(200, { files: [] })
      try { await newAdapter().listFiles(); throw new Error('should have thrown') } catch (err) {
        expect(err).to.be.instanceOf(UpstreamError)
        expect([502, 504]).to.include(err.status)
      }
    }).timeout(4000)

    it('throws UpstreamError when shape is invalid', async () => {
      nock(config.externalApi.baseUrl).get('/v1/secret/files').reply(200, { wrong: true })
      try { await newAdapter().listFiles(); throw new Error('should have thrown') } catch (err) {
        expect(err.status).to.equal(502)
      }
    })
  })

  describe('downloadFile()', () => {
    it('returns the raw CSV body on 200', async () => {
      nock(config.externalApi.baseUrl).get('/v1/secret/file/a.csv').reply(200, 'raw csv', { 'content-type': 'text/csv' })
      const out = await newAdapter().downloadFile('a.csv')
      expect(out).to.equal('raw csv')
    })

    it('throws UpstreamError on 500', async () => {
      nock(config.externalApi.baseUrl).get('/v1/secret/file/x.csv').reply(500)
      try { await newAdapter().downloadFile('x.csv'); throw new Error('should have thrown') } catch (err) {
        expect(err).to.be.instanceOf(UpstreamError)
        expect(err.status).to.equal(500)
      }
    })
  })
})
