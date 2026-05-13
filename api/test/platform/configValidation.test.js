'use strict'

const { expect } = require('chai')

describe('platform/config (invalid config)', () => {
  it('throws when an unknown field is present', () => {
    // We avoid hitting the real node-config loader; instead exercise the
    // validation chain directly via a tiny ad-hoc loader using ajv.
    const Ajv = require('ajv')
    const schema = require('../../src/platform/configSchema')
    const ajv = new Ajv({ allErrors: true })
    const validate = ajv.compile(schema)

    const invalid = {
      server: { port: 3000, corsOrigin: '*', rateLimit: { windowMs: 1000, max: 1 } },
      externalApi: {
        baseUrl: 'https://x',
        token: 't',
        timeoutMs: 100,
        downloadConcurrency: 1,
        bogusField: true
      },
      log: { level: 'info' }
    }

    expect(validate(invalid)).to.equal(false)
    expect(validate.errors.some((e) => /bogusField|additionalProperties/i.test(e.message + ' ' + (e.keyword || ''))))
      .to.equal(true)
  })

  it('rejects bad log level', () => {
    const Ajv = require('ajv')
    const schema = require('../../src/platform/configSchema')
    const validate = new Ajv().compile(schema)
    const bad = {
      server: { port: 3000, corsOrigin: '*', rateLimit: { windowMs: 1000, max: 1 } },
      externalApi: { baseUrl: 'https://x', token: 't', timeoutMs: 100, downloadConcurrency: 1 },
      log: { level: 'sparkly' }
    }
    expect(validate(bad)).to.equal(false)
  })

  it('rejects non-http(s) baseUrl', () => {
    const Ajv = require('ajv')
    const schema = require('../../src/platform/configSchema')
    const validate = new Ajv().compile(schema)
    const bad = {
      server: { port: 3000, corsOrigin: '*', rateLimit: { windowMs: 1000, max: 1 } },
      externalApi: { baseUrl: 'ftp://x', token: 't', timeoutMs: 100, downloadConcurrency: 1 },
      log: { level: 'info' }
    }
    expect(validate(bad)).to.equal(false)
  })
})
