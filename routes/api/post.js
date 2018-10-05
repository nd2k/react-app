const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

// Load Post & Profile models
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')

// Load validator Post
const validatePostInput = require('../../validations/post')

// @route   GET api/post/test
// @desc    Tests post route
// @access  Public
router.get('/test', (req, res) => res.json({ message: 'post works' }))

// @route   GET api/post/:id
// @desc    Get post by id
// @access  Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .sort({ date: -1 })
    .then(post => res.json(post))
    .catch(error =>
      res.status(404).json({ noPostFound: 'No post found with that id' })
    )
})

// @route   GET api/post
// @desc    Get post
// @access  Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(error => res.status(404).json({ noPostFound: 'No posts found' }))
})

// @route   POST api/post
// @desc    Create post
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body)

    // Check validation
    if (!isValid) {
      // If any errors, send 400 status with error object
      return res.status(400).json(errors)
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    })

    newPost.save().then(post => res.json(post))
  }
)

// @route   DELETE api/post/:id
// @desc    Delete post by id
// @access  Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check for post user
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notAuthorized: 'User not authorized' })
          }

          // Delete
          Post.remove().then(() => res.json({ success: true }))
        })
        .catch(error =>
          res.status(404).json({ postNotFound: 'Post not found' })
        )
    })
  }
)

// @route   POST api/post/like/:id
// @desc    Like post
// @access  Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyLiked: 'User already liked this post' })
          }

          // Add the user.id to the like array
          post.likes.unshift({ user: req.user.id })

          post.save().then(post => res.json(post))
        })
        .catch(error =>
          res.status(404).json({ postNotFound: 'Post not found' })
        )
    })
  }
)

// @route   POST api/post/unlike/:id
// @desc    Unlike post
// @access  Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notLiked: 'You have not yet like this post' })
          }

          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id)

          // Splice out of the array
          post.likes.splice(removeIndex, 1)

          // Save
          post.save().then(post => res.json(post))
        })
        .catch(error =>
          res.status(404).json({ postNotFound: 'Post not found' })
        )
    })
  }
)

// @route   POST api/post/comment/:id
// @desc    Add comment to post
// @access  Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body)

    // Check validation
    if (!isValid) {
      // If any errors, send 400 status with error object
      return res.status(400).json(errors)
    }

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        }

        // Add to comments array
        post.comments.unshift(newComment)

        // Save
        post.save().then(post => res.json(post))
      })
      .catch(error => res.status(400).json({ postNotFound: 'No post found' }))
  }
)

// @route   Delete api/post/comment/:id/:comment_id
// @desc    Delete comment from post
// @access  Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check if the comment exists
        if (
          post.comments.filter(
            comment => comment.id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentNotExists: 'Comment does not exist' })
        }

        // Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id)

        // Splice of the array
        post.comments.splice(removeIndex, 1)

        // Save
        post.save().then(post => res.json(post))
      })
      .catch(error => res.status(400).json({ postNotFound: 'No post found' }))
  }
)

module.exports = router
