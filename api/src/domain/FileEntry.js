'use strict'

const FileName = require('./FileName')
const FileLine = require('./FileLine')

class FileEntry {
  constructor (file, lines) {
    if (!(file instanceof FileName)) {
      throw new TypeError('FileEntry.file must be a FileName')
    }
    if (!Array.isArray(lines) || lines.some((l) => !(l instanceof FileLine))) {
      throw new TypeError('FileEntry.lines must be an array of FileLine')
    }
    this.file = file
    this.lines = lines
  }

  isEmpty () {
    return this.lines.length === 0
  }

  toJSON () {
    return {
      file: this.file.toString(),
      lines: this.lines.map((l) => l.toJSON())
    }
  }
}

module.exports = FileEntry
