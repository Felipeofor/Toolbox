'use strict'

const { buildContainer } = require('./platform/container')
const { buildHttpServer } = require('./interfaces/http/server')

const container = buildContainer()
const app = buildHttpServer(container)

const port = container.config.server.port
app.listen(port, () => {
  container.logger.info({ port }, 'toolbox-api listening')
})
