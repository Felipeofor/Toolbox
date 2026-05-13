'use strict'

const { expect } = require('chai')

const { buildParser } = require('../../src/infrastructure/csvParser')
const { buildGetFilesStats } = require('../../src/application/files/getFilesStats')

const silentLogger = { debug () {}, info () {}, warn () {}, error () {} }
const HEX = '70ad29aacf0b690b0467fe2b2767f765'

function csv (rows) {
  return ['file,text,number,hex', ...rows].join('\n')
}

describe('application/getFilesStats', () => {
  it('summarizes valid and discarded lines per file and globally', async () => {
    const fileSource = {
      listFiles: async () => ['ok.csv', 'mixed.csv', 'allbad.csv', 'fails.csv'],
      downloadFile: async (name) => {
        if (name === 'ok.csv') return csv([`ok.csv,a,1,${HEX}`])
        if (name === 'mixed.csv') return csv([`mixed.csv,a,1,${HEX}`, 'mixed.csv,b,bad,zzz'])
        if (name === 'allbad.csv') return csv(['allbad.csv,bad,nope,xxx'])
        const err = new Error('boom')
        err.status = 500
        throw err
      }
    }
    const parseCsv = buildParser({ logger: silentLogger })
    const getFilesStats = buildGetFilesStats({ fileSource, parseCsv, logger: silentLogger })

    const result = await getFilesStats()

    expect(result.summary).to.include({
      filesListed: 4,
      filesWithData: 2,
      filesEmpty: 1,
      filesFailed: 1,
      linesValid: 2,
      linesDiscarded: 2,
      linesConsidered: 4
    })
    expect(result.summary.successRate).to.equal(0.5)

    const perFileByName = Object.fromEntries(result.perFile.map((f) => [f.file, f]))
    expect(perFileByName['ok.csv']).to.deep.include({ valid: 1, discarded: 0, status: 'ok' })
    expect(perFileByName['mixed.csv']).to.deep.include({ valid: 1, discarded: 1, status: 'ok' })
    expect(perFileByName['allbad.csv']).to.deep.include({ valid: 0, discarded: 1, status: 'ok' })
    expect(perFileByName['fails.csv']).to.deep.include({ valid: 0, discarded: 0, status: 'download_failed' })
  })

  it('handles empty upstream listing', async () => {
    const parseCsv = buildParser({ logger: silentLogger })
    const getFilesStats = buildGetFilesStats({
      fileSource: { listFiles: async () => [], downloadFile: async () => '' },
      parseCsv,
      logger: silentLogger
    })
    const result = await getFilesStats()
    expect(result.summary.filesListed).to.equal(0)
    expect(result.summary.successRate).to.equal(0)
    expect(result.perFile).to.deep.equal([])
  })
})
