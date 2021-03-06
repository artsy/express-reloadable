const express = require('express')
const glob = require('glob')
const path = require('path')
const { createReloadable, isDevelopment } = require('@artsy/express-reloadable')

const app = express()

if (isDevelopment) {
  const mountAndReload = createReloadable(app, require)

  const modules = glob.sync('./components/**/*.js').map(name => path.resolve(name))

  // Note that if you need to mount an app at a particular root (`/api`), pass
  // in `mountPoint` as an option.
  app.use('/api', mountAndReload(path.resolve(__dirname, 'api'), {
    mountPoint: '/api',
    watchModules: [
      ...modules
      // or, `some-linked-npm-module`
    ]
  }))

  // Otherwise, just pass in the path to the express app and everything is taken care of
  mountAndReload(path.resolve(__dirname, 'client'))
} else {
  app.use('/api', require('./api'))
  app.use(require('./client'))
}

app.listen(3000, () => {
  console.log('Listening on http://localhost:3000')
})
