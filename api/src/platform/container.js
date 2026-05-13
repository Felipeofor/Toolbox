'use strict'

const { loadConfig } = require('./config')
const { buildLogger } = require('./logger')
const { buildMetrics } = require('./metrics')
const { buildEchoServAdapter } = require('../infrastructure/echoServAdapter')
const { buildParser } = require('../infrastructure/csvParser')
const { buildGetAllFilesData } = require('../application/files/getAllFilesData')
const { buildGetFileData } = require('../application/files/getFileData')
const { buildListFiles } = require('../application/files/listFiles')

/**
 * Composition root.
 * Accepts overrides for testing (any dependency can be injected).
 */
function buildContainer (overrides = {}) {
  const config = overrides.config || loadConfig()
  const logger = overrides.logger || buildLogger({ level: config.log.level })
  const metrics = overrides.metrics || buildMetrics()

  const fileSource = overrides.fileSource || buildEchoServAdapter({ config, logger })
  const parseCsv = overrides.parseCsv || buildParser({ logger })

  const useCases = {
    getAllFilesData: buildGetAllFilesData({
      fileSource,
      parseCsv,
      logger,
      concurrency: config.externalApi.downloadConcurrency
    }),
    getFileData: buildGetFileData({ fileSource, parseCsv, logger }),
    listFiles: buildListFiles({ fileSource })
  }

  return { config, logger, metrics, fileSource, parseCsv, useCases }
}

module.exports = { buildContainer }
