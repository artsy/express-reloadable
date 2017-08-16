const { NODE_ENV } = process.env
const isDevelopment = !NODE_ENV || NODE_ENV === 'development'

function createReloadable (app, require) {
  return (folderPath, options = {}) => {
    if (isDevelopment) {
      const {
        mountPoint = '/'
      } = options

      // On browser page reload, re-require app files
      const onReload = (req, res, next) => require(folderPath)(req, res, next)

      // Watch a subset of files for changes
      const watcher = require('chokidar').watch(folderPath)

      watcher.on('ready', () => {
        watcher.on('all', () => {
          Object.keys(require.cache).forEach(id => {
            if (id.startsWith(folderPath)) {
              delete require.cache[id]
            }
          })
        })
      })

      let currentResponse = null
      let currentNext = null

      app.use((req, res, next) => {
        currentResponse = res
        currentNext = next

        res.on('finish', () => {
          currentResponse = null
          currentNext = null
        })

        next()
      })

      /**
       * In case of an uncaught exception show it to the user and proceed, rather
       * than exiting the process.
       */
      process.on('uncaughtException', (error) => {
        if (currentResponse) {
          currentNext(error)
          currentResponse = null
          currentNext = null
        } else {
          process.abort()
        }
      })

      app.use(mountPoint, (req, res, next) => {
        onReload(req, res, next)
      })

      return onReload

      // Node env not 'development', exit
    } else {
      throw new Error(
        '(lib/reloadable.js) NODE_ENV must be set to "development" to use ' +
        'reloadable.js'
      )
    }
  }
}

module.exports = {
  isDevelopment,
  createReloadable
}
