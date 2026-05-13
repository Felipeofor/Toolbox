'use strict'

const FileName = require('../../../domain/FileName')
const { ValidationError } = require('../../../domain/errors')

function validateFileNameQuery (req, _res, next) {
  if (req.query.fileName === undefined) return next()
  const raw = req.query.fileName
  if (typeof raw !== 'string' || raw.trim() === '') {
    return next(new ValidationError('fileName query param must be a non-empty string'))
  }
  if (!FileName.isValid(raw.trim())) {
    return next(new ValidationError(`fileName has invalid format: ${raw}`))
  }
  req.validatedFileName = raw.trim()
  next()
}

module.exports = { validateFileNameQuery }
