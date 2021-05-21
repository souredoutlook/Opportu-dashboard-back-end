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
  const re = /^[~`!@#$%^&*()_\-+={[}\]|\\:;"'<,>.?\/A-Za-z\d]{8,}$/ //minimum eight characters inclusive of the following special characters: ~`!@#$%^&*()_-+={[}]|\:;"'<,>.?/
  return re.test(password)
}

/**
 * Checks ranked values against various constraints
 * @param {array} values an array of values objects
 * @returns boolean
 */
const validateRankedValues = function(values) {

  if (values instanceof Array && values.length === 10) {
    const core_values = values.reduce((prev, current) => {
      if (!current.is_custom) {
        return [...prev, current.value]
      } else {
        return prev;
      }
    }, []);

    while (core_values.length > 1) {
      const element = core_values.shift();
      if (core_values.includes(element)) {
        //core values are not unique
        return false;
      }
    };

    return true

  } else {
    //length is not valid
    return false

  }
};

/**
 * Checks facets object against various constraints
 * @param {object} facets 
 */
const validateFacets = function(facets) {
  const keys = Object.keys(facets);
  //check the number of keys
  if (keys && keys.length === 5) {
    const {will, energy, control, emotionality, affection} = facets;
    //check to see if all required keys are NOT undefined
    if (will && energy && control && emotionality && affection) {
      for (const key of keys) {
        const value = facets[key];
        //check to see if the value at key is a number within range
        if (typeof value !== 'number' || value <= 0 || value > 10) {
          //not a valid number
          return false;
        }
      }
      return true;
    } else {
      //not all required keys are defined
      return false;
    }
  } else {
    //number of keys is wrong
    return false;
  }
};

module.exports = { validateEmail, validatePassword, validateRankedValues, validateFacets };