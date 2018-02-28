const test = require('tape')
const express = require('express')
const decache = require('decache')

test('checks if NODE_ENV is set to development', (t) => {
  const app = express()
  process.env.NODE_ENV = 'production'

  try {
    const mountAndReload = require('../index').createReloadable(app, require)
    mountAndReload('./testModule')
    t.fail('No error thrown')
    t.end()
  } catch (e) {
    t.pass('This should throw an error')
    t.end()
  }
})

test('checks if throws except if NODE_ENV is set to production', (t) => {
  const app = express()

  decache('../index')
  process.env.NODE_ENV = 'development'
  const mountAndReload = require('../index').createReloadable(app, require)
  mountAndReload('./testModule')

  t.pass('No error thrown')
  t.end()
})