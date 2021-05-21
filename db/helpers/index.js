//index.js -> all of the data helpers flow through this file

const { core_values_reducer } = require('../../helpers/reducers');
const { getUsers, getUserByEmail, getUserById, addUser, alterPassword } = require("./users");
const {
  getCoreValuesAssessmentsById,
  addCoreValuesAssessmentById,
  getValuesAssessmentById,
  addCustomValue,
  updateValuesAssessmentById,
  addFacet5AssessmentById,
  getFacet5AssessmentById,
  updateFacet5AssessmentById,
} = require('./assessments');
const db = require('../pool');

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
        return res;
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

  const facets = getFacet5AssessmentById(id, true)
    .then(row => {
      if (row) {
        const { id, will, energy, control, emotionality, affection } = row;
        return { id, facets: { will, energy, control, emotionality, affection }};
      } else {
        return null;
      }
    });
  
  // configure data - example configuration
  
  // const assessments = {
  //   core_values: {},
  //   facets: {},
  //   strengths: {
  //     own: {},
  //     teams: [],
  //   },
  // };

  // return configured data
  return Promise.all([core_values, facets])
    .then(promises => {
      const assessments = {};

      if (promises[0]) {
        assessments.core_values = promises[0];
      }

      if (promises[1]) {
        assessments.facets = promises[1];
      }

      return assessments;
    })
}
exports.getAssessmentsByUserId = getAssessmentsByUserId;

/**
 * 
 * @param {*} assessment_id 
 * @param {*} values 
 * @returns 
 */
const addRankedValues = function(assessment_id, values) {

  const promises = [];

  for (const value of values) {
    if (value.is_custom) {
      promises.push(addCustomValue(value.value))
    }
  }

  const queryParams = [assessment_id];
  let queryString = `
    INSERT INTO ranked_values (assessment_id, core_value, custom_value_id, rank)
    VALUES
  `;

  return Promise.all(promises)
    .then(promises => {
      for (const [index, value] of values.entries()) {
        
        if (value.is_custom) {
          const custom_value = promises.shift()
          if (custom_value) {
            queryString += ` ($1, NULL, ${custom_value.id}, ${index + 1})`;
          } else {
            //custom value insertion failed
            return null;
          }
        } else {
          queryParams.push(value.value);
          queryString += ` ($1, $${queryParams.length}, NULL, ${index + 1})`;
        }

        index < values.length -1 ? queryString += ',' : queryString += ' RETURNING *;';

      }

      return db.query(queryString, queryParams)
        .then(response => {
          if (response.rows && response.rows.length > 0) {
            return response.rows;
          } else {
            //insertion has failed
            return null;
          }
        })
    })
    .catch(err => console.log(err));

};
exports.addRankedValues = addRankedValues;

// --- users ---
exports.getUsers = getUsers;

// assessments
exports.addCoreValuesAssessmentById = addCoreValuesAssessmentById;
exports.getValuesAssessmentById = getValuesAssessmentById;
exports.updateValuesAssessmentById = updateValuesAssessmentById;
exports.addFacet5AssessmentById = addFacet5AssessmentById;
exports.getFacet5AssessmentById = getFacet5AssessmentById;
exports.updateFacet5AssessmentById = updateFacet5AssessmentById;

// --- test ---

