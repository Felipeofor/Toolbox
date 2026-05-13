'use strict'

const { expect } = require('chai')
const nock = require('nock')
const { buildEchoServAdapter } = require('../../src/infrastructure/echoServAdapter')
const { UpstreamError } = require('../../src/domain/errors')

const config = {
  externalApi: {
    baseUrl: 'https://echo-serv.tbxnet.com',
    token: 'aSuperSecretKey',
    timeoutMs: 800,
    cacheTtlMs: 0,
    retry: { retries: 0, baseDelayMs: 0 },
    circuitBreaker: { timeoutMs: 5000, errorThresholdPercentage: 99, resetTimeoutMs: 100 }
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

  describe('caching listFiles()', () => {
    it('serves a second call from cache when cacheTtlMs > 0', async () => {
      const cachedConfig = {
        externalApi: { ...config.externalApi, cacheTtlMs: 5000 }
      }
      const adapter = require('../../src/infrastructure/echoServAdapter')
        .buildEchoServAdapter({ config: cachedConfig, logger: silentLogger })
      nock(config.externalApi.baseUrl)
        .get('/v1/secret/files')
        .reply(200, { files: ['a.csv', 'b.csv'] })
      const first = await adapter.listFiles()
      const second = await adapter.listFiles()
      expect(first).to.deep.equal(['a.csv', 'b.csv'])
      expect(second).to.deep.equal(['a.csv', 'b.csv'])
    })

    it('shutdown() clears cache + breakers without throwing', () => {
      const adapter = newAdapter()
      expect(() => adapter.shutdown()).to.not.throw()
    })
  })

  describe('retries', () => {
    it('retries upstream once on a transient 503 and then succeeds', async () => {
      const retryConfig = {
        externalApi: {
          ...config.externalApi,
          retry: { retries: 2, baseDelayMs: 5 }
        }
      }
      const adapter = require('../../src/infrastructure/echoServAdapter')
        .buildEchoServAdapter({ config: retryConfig, logger: silentLogger })

      nock(config.externalApi.baseUrl).get('/v1/secret/files').reply(503)
      nock(config.externalApi.baseUrl).get('/v1/secret/files').reply(200, { files: ['x.csv'] })

      const files = await adapter.listFiles()
      expect(files).to.deep.equal(['x.csv'])
    })
  })

  describe('correlation propagation', () => {
    it('forwards X-Request-Id when a context is active', async () => {
      const requestContext = require('../../src/platform/requestContext')
      const scope = nock(config.externalApi.baseUrl, {
        reqheaders: { 'x-request-id': 'corr-test-1' }
      }).get('/v1/secret/files').reply(200, { files: [] })

      await requestContext.run({ requestId: 'corr-test-1' }, () => newAdapter().listFiles())
      expect(scope.isDone()).to.equal(true)
    })
  })
})
