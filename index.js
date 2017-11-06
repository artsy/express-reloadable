const path = require('path')
const { NODE_ENV } = process.env
const isDevelopment = !NODE_ENV || NODE_ENV === 'development'

function createReloadable (app, require) {
  return (folderPath, options = {}) => {
    if (isDevelopment) {
      const {
        watchModules = [],
        mountPoint = '/'
      } = options

      // On browser page reload, re-require app files
      const onReload = (req, res, next) => require(folderPath)(req, res, next)
      const rootPath = path.resolve(folderPath)

      const watchPaths = watchModules
        .map(module => path.dirname(require.resolve(module)))
        .concat([rootPath])

      // Watch a subset of files for changes
      watchPaths.forEach(folder => {
        const watcher = require('chokidar').watch(folder)

        watcher.on('ready', () => {
          watcher.on('all', () => {
            Object.keys(require.cache).forEach(id => {
              if (id.startsWith(rootPath)) {
                delete require.cache[id]
              }
              if (id.startsWith(folder)) {
                delete require.cache[id]
              }
            })
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

      console.log(`(@artsy/express-reloadable) Mounting: \n${watchPaths.join('\n')}\n`)
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
