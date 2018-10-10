import axios from 'axios'
import setAuthToken from '../utils/setAuthToken'
import jwt_decode from 'jwt-decode'

import { GET_ERRORS, SET_CURRENT_USER } from './types'

// Register User
export const registerUser = (userData, history) => dispatch => {
  axios
    .post('/api/user/register', userData)
    .then(res => history.push('/login'))
    .catch(error =>
      dispatch({
        type: GET_ERRORS,
        payload: error.response.data
      })
    )
}

// Login User - Get token
export const loginUser = userData => dispatch => {
  axios
    .post('/api/user/login', userData)
    .then(res => {
      const { token } = res.data
      // Save token in localStorage
      localStorage.setItem('jwtToken', token)
      // Set token to auth header
      setAuthToken(token)
      // Decode token to get user data
      const decoded = jwt_decode(token)
      // Set current user
      dispatch(setCurrentUser(decoded))
    })
    .catch(error =>
      dispatch({
        type: GET_ERRORS,
        payload: error.response.data
      })
    )
}

// Set current user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  }
}

// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from localStorage
  localStorage.removeItem('jwtToken')
  // Remove auth header for future requests
  setAuthToken(false)
  // Set the current user to {} which will also set isAuthenticated = false
  dispatch(setCurrentUser({}))
}
