'use strict'

const { expect } = require('chai')
const { buildTtlCache } = require('../../src/infrastructure/ttlCache')

describe('infrastructure/ttlCache', () => {
  it('caches a value for the TTL window', () => {
    let now = 1000
    const cache = buildTtlCache({ ttlMs: 100, now: () => now })
    cache.set('k', 42)
    expect(cache.get('k')).to.equal(42)
    now += 50
    expect(cache.get('k')).to.equal(42)
    now += 60
    expect(cache.get('k')).to.equal(undefined)
  })

  it('memoize calls producer once within TTL', async () => {
    let calls = 0
    const cache = buildTtlCache({ ttlMs: 1000 })
    const producer = async () => { calls++; return 'x' }
    expect(await cache.memoize('k', producer)).to.equal('x')
    expect(await cache.memoize('k', producer)).to.equal('x')
    expect(calls).to.equal(1)
  })

  it('clear() invalidates the cached value', () => {
    const cache = buildTtlCache({ ttlMs: 1000 })
    cache.set('k', 1)
    cache.clear()
    expect(cache.get('k')).to.equal(undefined)
  })
})
