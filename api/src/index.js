'use strict'

const { buildContainer } = require('./platform/container')
const { buildHttpServer } = require('./interfaces/http/server')

const container = buildContainer()
const { config, logger, fileSource } = container
const app = buildHttpServer(container)

const port = config.server.port
const server = app.listen(port, () => {
  logger.info({ port }, 'toolbox-api listening')
})

let shuttingDown = false
function gracefulShutdown (signal) {
  if (shuttingDown) return
  shuttingDown = true
  logger.info({ signal }, 'graceful shutdown initiated')

  const timeoutMs = config.server.shutdownTimeoutMs
  const forceExit = setTimeout(() => {
    logger.warn({ timeoutMs }, 'forcing exit after shutdown timeout')
    process.exit(1)
  }, timeoutMs).unref()

  server.close((err) => {
    if (err) {
      logger.error({ err: err.message }, 'error closing http server')
    } else {
      logger.info('http server closed')
    }
    try {
      if (fileSource && typeof fileSource.shutdown === 'function') fileSource.shutdown()
    } catch (e) {
      logger.error({ err: e.message }, 'error during fileSource shutdown')
    }
    clearTimeout(forceExit)
    process.exit(err ? 1 : 0)
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('unhandledRejection', (reason) => {
  logger.error({ reason: reason && reason.message ? reason.message : reason }, 'unhandledRejection')
})
process.on('uncaughtException', (err) => {
  logger.error({ err: err.message, stack: err.stack }, 'uncaughtException')
  gracefulShutdown('uncaughtException')
})
