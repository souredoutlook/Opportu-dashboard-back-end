//index.js -> all of the data helpers flow through this file

const { core_values_reducer } = require('../../helpers/reducers');
const { getUsers, getUserByEmail, getUserById, addUser, alterPassword } = require("./users");
const { getCoreValuesAssessmentsById, addCoreValuesAssessmentById, getValuesAssessmentById } = require('./assessments');

/**
 * Compares password to hashed password in db for user with a given email
 * @param {string} email 
 * @param {string} password 
 * @returns 
 */
const validateUser = function(email, password, bcrypt) {
  return getUserByEmail(email)
    .then(res => {
      if (res && bcrypt.compareSync(password, res.password)) {
        return res.id
      } else {
        return null;
      }
    });
};
exports.validateUser = validateUser;

const isAdmin = function(id) {
  return getUserById(id)
    .then(res => {
      if(res) {
        if (res.is_admin === true) {
          return true
        } else {
          return false
        }
      } else {
        return null
      }
    });
};
exports.isAdmin = isAdmin;

/**
 * Validates uniqueness of email in db and then calls addUser if valid
 * @param {string} first_name 
 * @param {string} last_name 
 * @param {string} email 
 * @param {string} password 
 * @param {bcrypt} bcrypt dependency
 * @returns addUser query promise
 */
const addUserIfUnique = function(first_name, last_name, email, password, bcrypt) {

  return getUserByEmail(email)
    .then(res => {
      if (res) {
        return null
      } else {
        const encryptedPassword = bcrypt.hashSync(password, 10);
        return addUser(first_name, last_name, email, encryptedPassword);
      }
    })
};
exports.addUserIfUnique = addUserIfUnique;

/**
 * Validates uniqueness of email in db and then calls addUser if valid
 * @param {number} id
 * @param {string} old_password 
 * @param {string} new_password
 * @param {bcrypt} bcrypt dependency
 * @returns addUser query promise
 */
 const updatePassword = function(id, old_password, new_password, bcrypt) {
  return getUserById(id)
    .then(res => {
      if (res && bcrypt.compareSync(old_password, res.password)) {
        const encryptedPassword = bcrypt.hashSync(new_password, 10);
        return alterPassword(id, encryptedPassword);
      } else {
        //invalid id or wrong password
        return null;
      }
    })
  };
  exports.updatePassword = updatePassword;
  
const getAssessmentsByUserId = function(id) {
  //get all assessments

  const core_values = getCoreValuesAssessmentsById(id)
    .then(rows => {
      if (rows) {
        return core_values_reducer(rows);
      } else {
        return null;
      }
    });
  
  // configure data - example configuration
  
  // const assessments = {
  //   core_values: {},
  //   facet_5: {},
  //   strengths: {
  //     own: {},
  //     teams: [],
  //   },
  // };

  // return configured data
  return Promise.all([core_values])
    .then(promises => {
      const assessments = {};

      if (promises[0]) {
        assessments.core_values = promises[0];
      }

      return assessments;
    })
}
exports.getAssessmentsByUserId = getAssessmentsByUserId;

// --- users ---
exports.getUsers = getUsers;

// assessments
exports.addCoreValuesAssessmentById = addCoreValuesAssessmentById;
exports.getValuesAssessmentById = getValuesAssessmentById;