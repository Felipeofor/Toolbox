// @ts-check
const { test, expect, request } = require('@playwright/test')

const API_URL = process.env.API_BASE_URL || 'http://localhost:3000'

test.describe('API contract', () => {
  test('health, ready, list, data and stats respond with the documented shapes', async ({ playwright }) => {
    const ctx = await playwright.request.newContext({ baseURL: API_URL })

    const health = await ctx.get('/health')
    expect(health.status()).toBe(200)
    expect(await health.json()).toEqual({ status: 'ok' })

    const ready = await ctx.get('/ready')
    expect([200, 503]).toContain(ready.status())

    const list = await ctx.get('/v1/files/list')
    expect(list.status()).toBe(200)
    const listBody = await list.json()
    expect(Array.isArray(listBody.files)).toBe(true)

    const data = await ctx.get('/v1/files/data')
    expect(data.status()).toBe(200)
    const dataBody = await data.json()
    expect(Array.isArray(dataBody)).toBe(true)

    const stats = await ctx.get('/v1/files/stats')
    expect(stats.status()).toBe(200)
    const statsBody = await stats.json()
    expect(statsBody.summary).toHaveProperty('filesListed')
    expect(Array.isArray(statsBody.perFile)).toBe(true)
  })

  test('echoes X-Request-Id when provided', async ({ playwright }) => {
    const ctx = await playwright.request.newContext({ baseURL: API_URL })
    const id = 'e2e-correlation-001'
    const res = await ctx.get('/health', { headers: { 'X-Request-Id': id } })
    expect(res.headers()['x-request-id']).toBe(id)
  })

  test('rejects invalid fileName (path traversal)', async ({ playwright }) => {
    const ctx = await playwright.request.newContext({ baseURL: API_URL })
    const res = await ctx.get('/v1/files/data?fileName=' + encodeURIComponent('../etc/passwd'))
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('validation_error')
  })
})
