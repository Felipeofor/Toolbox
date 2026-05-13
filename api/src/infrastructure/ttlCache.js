'use strict'

/**
 * Tiny in-memory TTL cache (single key per instance is fine for our use).
 * Not a generic cache library — we want zero deps and explicit ownership.
 */
function buildTtlCache ({ ttlMs, now = () => Date.now() }) {
  let entry = null

  function get (key) {
    if (!entry || entry.key !== key) return undefined
    if (entry.expiresAt <= now()) {
      entry = null
      return undefined
    }
    return entry.value
  }

  function set (key, value) {
    entry = { key, value, expiresAt: now() + ttlMs }
  }

  function clear () {
    entry = null
  }

  async function memoize (key, producer) {
    const cached = get(key)
    if (cached !== undefined) return cached
    const value = await producer()
    set(key, value)
    return value
  }

  return { get, set, clear, memoize }
}

module.exports = { buildTtlCache }
