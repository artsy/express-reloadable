# @artsy/express-reloadable

When developing a Node app it's common to rely on tools like [`node-dev`](https://github.com/fgnass/node-dev) or [`nodemon`](https://github.com/remy/nodemon) to make the development process more rapid by automatically restarting the server instance on file-change. What `express-reloadable` does is listen for source-code changes within a subset of your app and, scanning Node's internal module cache, clears the `require` call if found. This tricks Node into thinking the module has not yet been loaded, effectively hot-swapping out your code without a full restart. Additionally, when the `watchModules` option is passed, `express-reloadable` will listen for changes to NPM module code and reload on change. Useful when working with `yarn link` across packages / repos. Crazy-fast development speed!

(**Disclaimer**: While this works for most of our use-cases, this is effectively a hack and hasn't been tested in all environments. Your mileage may vary :)

**How it works**:
- `express-reloadable` is called with a path to an app, which it then mounts
- When source-code within that folder / app changes an internal lookup is made to Node, scanning its `require` cache for the changed file
- If found, it is cleared internally via `delete require.cache[id]`
- When a new request is made `express-reloadable` executes a callback that re-requires the code and changes are instantly available.

**Installation**:

```sh
yarn add @artsy/express-reloadable
```

**Example**:

The below example assumes that the folders `/api` and `/client` exist, and that each contain an index file that exports a mountable express.js route.

```js
import express from 'express'
import { createReloadable, isDevelopment } from '@artsy/express-reloadable'

const app = express()

if (isDevelopment) {

  // Pass in `app` and current `require` context
  const mountAndReload = createReloadable(app, require)

  // Pass in the path to an express sub-app and everything is taken care of
  mountAndReload(path.resolve(__dirname, './client'))

  // Full example:
  app.use('/api', mountAndReload(path.resolve(__dirname, './api')), {

    // If you need to mount an app at a particular root (`/api`), pass in
    // `mountPoint` as an option.
    mountPoint: '/api',

    // Or if you're using `yarn link` (or npm) to symlink external dependencies
    // during dev, pass in an array of modules to watch. Changes made internally
    // will be instantly available in the app.
    watchModules: [
      '@artsy/reaction',
      '@artsy/artsy-xapp'
    ]

    // Defaults to `false`. If set to `true` not only the module itself but its tree of dependencies will be removed from the node require cache.
    // When set to `false`, only the module itself would be removed from the cache.
    recursive: false
  }))

  // If prod, mount apps like normal
} else {
  app.use('/api', require('./api')
  app.use(require('./client')
}

app.listen(3000, () => {
  console.log(`Listening on port 3000`)
})
```

**Troubleshooting**:

> Help! I've mounted my app using reloadable but I'm not seeing any changes?

For the utility to work you need to a) ensure that `NODE_ENV=development` (for safety) and b) the path to your app is absolute:

```js
// Incorrect
app.use(reloadAndMount('./path/to/app'))

// Correct :)
app.use(reloadAndMount(path.resolve(__dirname, 'path/to/app')))
```

**Thanks**:

This package was heavily inspired by @glenjamin's [ultimate-hot-loading-example](https://github.com/glenjamin/ultimate-hot-reloading-example).
