const express = require('express')
const app = module.exports = express()

app.get('/users', (req, res, next) => {
  res.json([
    {
      name: 'Katherine'
    },
    {
      name: 'Dusty'
    },
    {
      name: 'Moira'
    }
  ])
})

return app
