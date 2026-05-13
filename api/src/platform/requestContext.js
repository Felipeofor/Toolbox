'use strict'

const { AsyncLocalStorage } = require('async_hooks')

const storage = new AsyncLocalStorage()

function run (context, fn) {
  return storage.run(context, fn)
}

function get () {
  return storage.getStore() || null
}

function getRequestId () {
  const ctx = get()
  return ctx ? ctx.requestId : undefined
}

module.exports = { storage, run, get, getRequestId }
