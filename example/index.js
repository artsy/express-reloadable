const express = require('express')
const path = require('path')
const { createReloadable, isDevelopment } = require('@artsy/express-reloadable')

const app = express()

if (isDevelopment) {
  const mountAndReload = createReloadable(app, require)

  // Note that if you need to mount an app at a particular root (`/api`), pass
  // in `mountPoint` as an option.
  app.use('/api', mountAndReload('./api', {
    mountPoint: '/api'
  }))

  // Otherwise, just pass in the path to the express app and everything is taken care of
  mountAndReload('./client')
} else {
  app.use('/api', require('./api'))
  app.use(require('./client'))
}

app.listen(3000, () => {
  console.log(`Listening on port 3000`)
})
