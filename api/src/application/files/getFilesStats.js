'use strict'

function buildGetFilesStats ({ fileSource, parseCsv, logger, concurrency = 5 }) {
  async function statsForFile (name) {
    try {
      const content = await fileSource.downloadFile(name)
      const { lines, discarded, considered } = parseCsv.withStats(content, name)
      return {
        file: name,
        valid: lines.length,
        discarded,
        considered,
        successRate: considered === 0 ? 0 : lines.length / considered,
        status: 'ok'
      }
    } catch (err) {
      logger.warn({ file: name, err: err.message, status: err.status }, 'stats: file download failed')
      return {
        file: name,
        valid: 0,
        discarded: 0,
        considered: 0,
        successRate: 0,
        status: 'download_failed'
      }
    }
  }

  return async function getFilesStats () {
    const files = await fileSource.listFiles()
    const perFile = []
    for (let i = 0; i < files.length; i += concurrency) {
      const batch = files.slice(i, i + concurrency)
      const settled = await Promise.allSettled(batch.map(statsForFile))
      for (const r of settled) {
        if (r.status === 'fulfilled') perFile.push(r.value)
      }
    }

    const totals = perFile.reduce((acc, f) => {
      acc.valid += f.valid
      acc.discarded += f.discarded
      acc.considered += f.considered
      if (f.status === 'download_failed') acc.failed++
      else if (f.valid === 0) acc.empty++
      else acc.withData++
      return acc
    }, { valid: 0, discarded: 0, considered: 0, failed: 0, empty: 0, withData: 0 })

    return {
      summary: {
        filesListed: files.length,
        filesWithData: totals.withData,
        filesEmpty: totals.empty,
        filesFailed: totals.failed,
        linesValid: totals.valid,
        linesDiscarded: totals.discarded,
        linesConsidered: totals.considered,
        successRate: totals.considered === 0 ? 0 : totals.valid / totals.considered
      },
      perFile
    }
  }
}

module.exports = { buildGetFilesStats }
