const chalk = require('chalk')
const path = require('path')
const { NODE_ENV } = process.env
const isDevelopment = !NODE_ENV || NODE_ENV === 'development'
const decache = require('decache')

function createReloadable (app, require) {
  return (folderPath, options = {}) => {
    if (!isDevelopment) {
      throw new Error(
        '[lib/reloadable.js] NODE_ENV must be set to "development" to use ' +
        'reloadable.js'
      )
    }

    const {
      watchModules = [],
      mountPoint = '/',
      recursive = false
    } = options

    // On new request re-require app files
    const onReload = (req, res, next) => {
      const module = require(folderPath)

      // Check if ES6 default export
      if (module.default) {
        module.default(req, res, next)
      } else {
        module(req, res, next)
      }
    }

    const rootPath = path.resolve(folderPath)

    const watchPaths = watchModules
      .map(module => path.dirname(require.resolve(module)))
      .concat([rootPath])

    // Watch a subset of files for changes
    watchPaths.forEach(folder => {
      const watcher = require('chokidar').watch(folder)

      watcher.on('ready', () => {
        watcher.on('change', file => console.log(`[@artsy/express-reloadable] File ${chalk.grey(file)} has changed.`))

        watcher.on('all', () => {
          Object.keys(require.cache).forEach(id => {
            if (id.startsWith(rootPath) || id.startsWith(folder)) {
              if (recursive) {
                decache(id)
              } else {
                delete require.cache[id]
              }
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
        console.log(error)
      }
    })

    app.use(mountPoint, (req, res, next) => {
      try {
        onReload(req, res, next)
      } catch (error) {
        console.error(error)
        next(error)
      }
    })

    console.log(`\n\n[@artsy/express-reloadable] Mounting: \n${chalk.grey(watchPaths.join('\n'))}\n`)
    return onReload
  }
}

module.exports = {
  isDevelopment,
  createReloadable
}
