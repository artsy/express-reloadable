const express = require('express')
const app = module.exports = express()
const { otherUsers } = require('../components/users')

app.get('/users', (req, res) => {
  res.json([
    {
      name: 'Katherine'
    },
    {
      name: 'Dusty'
    },
    {
      name: 'Moira'
    },
    ...otherUsers()
  ])
})

return app
