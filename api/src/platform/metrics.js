'use strict'

const client = require('prom-client')

function buildMetrics () {
  const registry = new client.Registry()
  client.collectDefaultMetrics({ register: registry, prefix: 'toolbox_api_' })

  const httpDuration = new client.Histogram({
    name: 'toolbox_api_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [registry]
  })

  const httpTotal = new client.Counter({
    name: 'toolbox_api_http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [registry]
  })

  function middleware (req, res, next) {
    const start = process.hrtime.bigint()
    res.on('finish', () => {
      const route = (req.route && req.route.path) || req.path || 'unknown'
      const labels = { method: req.method, route, status: String(res.statusCode) }
      const diffNs = Number(process.hrtime.bigint() - start)
      httpDuration.observe(labels, diffNs / 1e9)
      httpTotal.inc(labels)
    })
    next()
  }

  return { registry, middleware }
}

module.exports = { buildMetrics }
