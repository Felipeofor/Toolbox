'use strict'

const { expect } = require('chai')
const requestContext = require('../../src/platform/requestContext')

describe('platform/requestContext', () => {
  it('returns null outside a context', () => {
    expect(requestContext.get()).to.equal(null)
    expect(requestContext.getRequestId()).to.equal(undefined)
  })

  it('propagates requestId across async boundaries', (done) => {
    requestContext.run({ requestId: 'abc-123' }, () => {
      setImmediate(() => {
        expect(requestContext.getRequestId()).to.equal('abc-123')
        done()
      })
    })
  })

  it('isolates contexts per run', async () => {
    const a = requestContext.run({ requestId: 'A' }, async () => requestContext.getRequestId())
    const b = requestContext.run({ requestId: 'B' }, async () => requestContext.getRequestId())
    expect(await a).to.equal('A')
    expect(await b).to.equal('B')
  })
})
