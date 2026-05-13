'use strict'

function buildListFiles ({ fileSource }) {
  return async function listFiles () {
    const files = await fileSource.listFiles()
    return { files }
  }
}

module.exports = { buildListFiles }
