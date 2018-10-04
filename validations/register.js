const validator = require('validator')
const isEmpty = require('./is_empty')

module.exports = function validateRegisterInput(data) {
  let errors = {}

  if (!validator.isLength(data.displayName, { min: 2, max: 50 })) {
    errors.displayName = 'Name must be between 2 & 50 characters'
  }
  return {
    errors,
    isValid: isEmpty(errors)
  }
}
