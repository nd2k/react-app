const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('passport')

// Load input validation
const validateRegisterInput = require('../../validations/register')
// Load User model
const User = require('../../models/User')

// @route   GET api/user/test
// @desc    Tests user route
// @access  Public
router.get('/test', (req, res) => res.json({ message: 'user works' }))

// @route   POST api/user/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body)

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors)
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ error: 'Email already exists' })
    } else {
      const newUser = new User({
        email: req.body.email,
        displayName: req.body.displayName,
        password: req.body.password,
        avatar: req.body.avatar
      })

      bcrypt.genSalt(10, (error, salt) => {
        bcrypt.hash(newUser.password, salt, (error, hash) => {
          if (error) throw error
          newUser.password = hash
          newUser
            .save()
            .then(user => res.json({ user }))
            .catch(error => console.log(error))
        })
      })
    }
  })
})

// @route   POST api/user/login
// @desc    Login User / return JwT token
// @access  Public
router.post('/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check for user
    if (!user) {
      return res.status(404).json({ email: 'User not found' })
    }

    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User found
        const payload = {
          id: user.id,
          displayName: user.displayName,
          avatar: user.avatar
        }
        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (error, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token
            })
          }
        )
      } else {
        return res.status(400).json({ password: 'Password incorrect' })
      }
    })
  })
})

// @route   GET api/user/current
// @desc    Return current user
// @access  Private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      displayName: req.user.displayName,
      email: req.user.email,
      avatar: req.user.avatar
    })
  }
)

module.exports = router
