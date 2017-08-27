const http = require('axios')
const express = require('express')
const app = module.exports = express()

app.get('/', async (req, res, next) => {
  try {
    const { data: users } = await http.get('http://localhost:3000/api/users')

    res.send(`
      <html>
      <head>
        <title>Example</title>
      </head>
      <body>
        <p>
          Change this file, or the file located in /api, and reload the page
        </p>
        <h4>
          Users:
        </h4>
        <p>
          ${users.map(({ name }) => name).join(', ')}
        </p>
      </body>
      </html>
    `)
  } catch (error) {
    next(error)
  }
})

return app
