'use strict'

const { expect } = require('chai')

describe('platform/config (schema validation)', () => {
  it('loads valid config when NODE_ENV=test', () => {
    delete require.cache[require.resolve('config')]
    delete require.cache[require.resolve('../../src/platform/config')]
    const { loadConfig } = require('../../src/platform/config')
    const cfg = loadConfig()
    expect(cfg.server.port).to.be.a('number')
    expect(cfg.externalApi.baseUrl).to.match(/^https?:\/\//)
    expect(cfg.externalApi.timeoutMs).to.be.a('number')
    expect(cfg.log.level).to.be.a('string')
  })

  it('exposes default values when optional sections are omitted', () => {
    delete require.cache[require.resolve('../../src/platform/config')]
    const { loadConfig } = require('../../src/platform/config')
    const cfg = loadConfig()
    expect(cfg.server).to.have.property('shutdownTimeoutMs')
    expect(cfg.externalApi.retry).to.have.property('retries')
    expect(cfg.externalApi.circuitBreaker).to.have.property('timeoutMs')
  })
})
