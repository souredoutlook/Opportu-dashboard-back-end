// helpers/index.js

/**
 * Check string against regular expression to see if it is a valid email
 * @param {string} email 
 * @returns boolean
 */
const validateEmail = function(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

/**
 * Check string against regular expression to see if it is a valid password
 * @param {string} password
 * @returns boolean
 */
const validatePassword = function(password) {
  // const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; //at least one character and one number, minimum eight characters
  const re = /^[~`! @#$%^&*()_\-+={[}\]|\\:;"'<,>.?\/A-Za-z\d]{8,}$/ //minimum eight characters inclusive of the following special characters: ~`! @#$%^&*()_-+={[}]|\:;"'<,>.?/
  return re.test(password)
}

module.exports = { validateEmail, validatePassword };