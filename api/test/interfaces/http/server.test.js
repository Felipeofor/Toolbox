'use strict'

const { expect } = require('chai')
const request = require('supertest')
const pino = require('pino')

const { buildContainer } = require('../../../src/platform/container')
const { buildHttpServer } = require('../../../src/interfaces/http/server')
const Hex = require('../../../src/domain/Hex')
const FileLine = require('../../../src/domain/FileLine')

const HEX = '70ad29aacf0b690b0467fe2b2767f765'
const silentLogger = pino({ level: 'silent' })

function buildAppWith ({ files, perFile, downloadFails }) {
  const fileSource = {
    async listFiles () { return files },
    async downloadFile (name) {
      if (downloadFails && downloadFails.includes(name)) {
        const e = new Error('upstream down')
        e.status = 500
        throw e
      }
      return 'irrelevant'
    }
  }
  const parseCsv = (_content, fileName) => (perFile[fileName] || []).map(
    (l) => new FileLine({ text: l.text, number: l.number, hex: new Hex(l.hex) })
  )
  parseCsv.withStats = (_content, fileName) => {
    const lines = parseCsv(_content, fileName)
    return { lines, discarded: 0, considered: lines.length }
  }
  const container = buildContainer({ logger: silentLogger, fileSource, parseCsv })
  return buildHttpServer(container)
}

describe('interfaces/http/server', () => {
  describe('GET /health and /ready', () => {
    it('/health is always 200', async () => {
      const app = buildAppWith({ files: [], perFile: {} })
      const res = await request(app).get('/health')
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({ status: 'ok' })
    })

    it('/ready returns 200 when upstream is reachable', async () => {
      const app = buildAppWith({ files: [], perFile: {} })
      const res = await request(app).get('/ready')
      expect(res.status).to.equal(200)
      expect(res.body.status).to.equal('ready')
    })

    it('/ready returns 503 when upstream fails', async () => {
      const badSource = { listFiles: async () => { throw new Error('upstream') } }
      const container = buildContainer({ logger: silentLogger, fileSource: badSource, parseCsv: () => [] })
      const app = buildHttpServer(container)
      const res = await request(app).get('/ready')
      expect(res.status).to.equal(503)
    })
  })

  describe('GET /files/data', () => {
    it('returns aggregated JSON for all files', async () => {
      const app = buildAppWith({
        files: ['a.csv', 'b.csv'],
        perFile: {
          'a.csv': [{ text: 'x', number: 1, hex: HEX }],
          'b.csv': [{ text: 'y', number: 2, hex: HEX }]
        }
      })
      const res = await request(app).get('/files/data')
      expect(res.status).to.equal(200)
      expect(res.headers['content-type']).to.match(/application\/json/)
      expect(res.body).to.deep.equal([
        { file: 'a.csv', lines: [{ text: 'x', number: 1, hex: HEX }] },
        { file: 'b.csv', lines: [{ text: 'y', number: 2, hex: HEX }] }
      ])
    })

    it('omits files with download failure', async () => {
      const app = buildAppWith({
        files: ['ok.csv', 'bad.csv'],
        perFile: { 'ok.csv': [{ text: 'x', number: 1, hex: HEX }] },
        downloadFails: ['bad.csv']
      })
      const res = await request(app).get('/files/data')
      expect(res.status).to.equal(200)
      expect(res.body).to.have.lengthOf(1)
    })

    it('returns 400 on invalid fileName', async () => {
      const app = buildAppWith({ files: [], perFile: {} })
      const res = await request(app).get('/files/data?fileName=../etc/passwd')
      expect(res.status).to.equal(400)
      expect(res.body.error).to.equal('validation_error')
    })

    it('returns 400 on empty fileName', async () => {
      const app = buildAppWith({ files: [], perFile: {} })
      const res = await request(app).get('/files/data?fileName=')
      expect(res.status).to.equal(400)
    })

    it('returns 404 when fileName is not in the upstream listing', async () => {
      const app = buildAppWith({ files: ['a.csv'], perFile: {} })
      const res = await request(app).get('/files/data?fileName=missing.csv')
      expect(res.status).to.equal(404)
      expect(res.body.error).to.equal('not_found')
    })

    it('returns 200 with only the requested file when present', async () => {
      const app = buildAppWith({
        files: ['a.csv', 'b.csv'],
        perFile: { 'a.csv': [{ text: 'x', number: 1, hex: HEX }] }
      })
      const res = await request(app).get('/files/data?fileName=a.csv')
      expect(res.status).to.equal(200)
      expect(res.body).to.have.lengthOf(1)
      expect(res.body[0].file).to.equal('a.csv')
    })
  })

  describe('GET /files/list', () => {
    it('returns {files} verbatim from upstream', async () => {
      const app = buildAppWith({ files: ['a.csv', 'b.csv'], perFile: {} })
      const res = await request(app).get('/files/list')
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({ files: ['a.csv', 'b.csv'] })
    })
  })

  describe('GET /files/stats', () => {
    it('returns summary + perFile entries', async () => {
      const app = buildAppWith({
        files: ['a.csv'],
        perFile: { 'a.csv': [{ text: 'x', number: 1, hex: HEX }] }
      })
      const res = await request(app).get('/files/stats')
      expect(res.status).to.equal(200)
      expect(res.body.summary).to.have.property('filesListed')
      expect(res.body.summary).to.have.property('successRate')
      expect(res.body.perFile).to.be.an('array')
    })
  })

  describe('observability', () => {
    it('exposes /metrics in Prometheus format', async () => {
      const app = buildAppWith({ files: [], perFile: {} })
      await request(app).get('/health')
      const res = await request(app).get('/metrics')
      expect(res.status).to.equal(200)
      expect(res.text).to.match(/toolbox_api_http_requests_total/)
    })

    it('exposes /openapi.json', async () => {
      const app = buildAppWith({ files: [], perFile: {} })
      const res = await request(app).get('/openapi.json')
      expect(res.status).to.equal(200)
      expect(res.body.openapi).to.equal('3.0.3')
      expect(res.body.paths['/files/data']).to.be.an('object')
    })

    it('exposes Swagger UI at /docs', async () => {
      const app = buildAppWith({ files: [], perFile: {} })
      const res = await request(app).get('/docs/').redirects(1)
      expect(res.status).to.be.oneOf([200, 301])
    })
  })

  describe('security', () => {
    it('sets helmet security headers', async () => {
      const app = buildAppWith({ files: [], perFile: {} })
      const res = await request(app).get('/health')
      expect(res.headers['x-content-type-options']).to.equal('nosniff')
      expect(res.headers).to.have.property('x-dns-prefetch-control')
    })

    it('returns 404 with JSON for unknown routes', async () => {
      const app = buildAppWith({ files: [], perFile: {} })
      const res = await request(app).get('/no-such-route')
      expect(res.status).to.equal(404)
      expect(res.body.error).to.equal('not_found')
    })
  })
})
