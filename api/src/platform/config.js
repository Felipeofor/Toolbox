'use strict'

const nodeConfig = require('config')

function loadConfig () {
  return {
    server: {
      port: nodeConfig.get('server.port'),
      corsOrigin: nodeConfig.get('server.corsOrigin'),
      rateLimit: nodeConfig.has('server.rateLimit')
        ? nodeConfig.get('server.rateLimit')
        : { windowMs: 60000, max: 120 }
    },
    externalApi: {
      baseUrl: nodeConfig.get('externalApi.baseUrl'),
      token: nodeConfig.get('externalApi.token'),
      timeoutMs: nodeConfig.get('externalApi.timeoutMs'),
      downloadConcurrency: nodeConfig.has('externalApi.downloadConcurrency')
        ? nodeConfig.get('externalApi.downloadConcurrency')
        : 5
    },
    log: {
      level: nodeConfig.has('log.level') ? nodeConfig.get('log.level') : 'info'
    }
  }
}

module.exports = { loadConfig }
