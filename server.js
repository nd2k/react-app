const express = require('express')
const key = require('./config/keys')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const passport = require('passport')

const user = require('./routes/api/user')
const profile = require('./routes/api/profile')
const post = require('./routes/api/post')

const app = express()

// BodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Morgan middleware
app.use(morgan('dev'))

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

// Passport middleware
app.use(passport.initialize())

// Passport config
require('./config/passport')(passport)

// User routes
app.use('/api/user', user)
app.use('/api/profile', profile)
app.use('/api/post', post)

app.listen(key.port, () => console.log(`Server running on port ${key.port}`))
