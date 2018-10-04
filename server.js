const express = require('express')
const key = require('./config/keys')
const mongoose = require('mongoose')

const user = require('./routes/api/user')
const profile = require('./routes/api/profile')
const post = require('./routes/api/post')

const app = express()

// DB config
const db = require('./config/keys').mongoURI

// Connect to mongoDB thru mongoose
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log(`Mongodb is connected on ${db}`))
  .catch(err => console.log('Connection failed', err))

app.get('/', (req, res) => res.send('Hello'))

// User routes
app.use('/api/user', user)
app.use('/api/profile', profile)
app.use('/api/post', post)

app.listen(key.port, () => console.log(`Server running on port ${key.port}`))
