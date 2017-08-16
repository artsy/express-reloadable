# express-reloadable

When developing a Node app it's common to rely on tools like [`node-dev`](https://github.com/fgnass/node-dev) or [`nodemon`](https://github.com/remy/nodemon) to make the development process more rapid by automatically restarting the server instance on file-change. What `express-reloadable` does is listen for source-code changes within a subset of your app and, scanning Node's internal module cache, clears the `require` call if found. This tricks Node into thinking the module has not yet been loaded, effectively hot-swapping out your code without a full restart. Crazy-fast development speed!

(**Disclaimer**: While this works for most of our use-cases, this is effectively a hack and hasn't been tested in all environments. Your milage may vary :)

**How it works**:
- `express-reloadable` is called with a path to an app, which it then mounts
- When source-code within that folder / app changes an internal lookup is made to Node, scanning its `require` cache for the changed file
- If found, it is cleared internally via `delete require.cache[id]`
- When the browser is reloaded `express-reloadable` executes a callback that re-requires the code and changes are instantly available.

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

  // Pass in app and current `require` context
  const reloadAndMount = createReloadable(app, require)

  // Note that if you need to mount an app at a particular root (`/api`), pass
  // in `mountPoint` as an option.
  app.use('/api', reloadAndMount(path.resolve(__dirname, 'api'), {
    mountPoint: '/api'
  }))

  // Otherwise, just pass in the path to the express app and everything is taken care of
  reloadAndMount(path.resolve(__dirname, 'client'))
} else {
  app.use('/api', require('./api')
  app.use(require('./client')
}

app.listen(3000, () => {
  console.log(`Listening on port 3000`)
})
```

**Thanks**:

This package was heavily inspired by @glenjamin's [ultimate-hot-loading-example](https://github.com/glenjamin/ultimate-hot-reloading-example).
