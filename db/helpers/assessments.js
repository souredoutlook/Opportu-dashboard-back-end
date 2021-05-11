const db = require('../pool');

const getCoreValuesAssessmentsById = function(id) {

  const queryParams = [id];
  const queryString = `
  SELECT user_id, assessment_id, core_value, name as custom_value, rank
  FROM values_assessments
  JOIN ranked_values ON values_assessments.id = assessment_id
  FULL OUTER JOIN custom_values ON custom_value_id = custom_values.id
  WHERE user_id = $1
  ORDER BY assessment_id, rank;
  `

  return db.query(queryString, queryParams)
     .then(res => {
      if (res.rows && res.rows.length !== 0) {
        return res.rows;
      } else {
        //return null when no assessments are associated with that id
        return null;
      }
     })
};

/**
 * Creates a new core_values_assessment for the specified user
 * @param {number} id of user 
 * @returns {number} returns a core_values_assessment_id or null if the given id is not valid
 */
 const addCoreValuesAssessmentById = function(id) {
  const queryParams = [id]
  const queryString = `
    INSERT INTO values_assessments (user_id)
    VALUES ($1)
    RETURNING *;
  `;

  return db.query(queryString, queryParams)
     .then(res => {
      if (res.rows && res.rows.length > 0) {
        return res.rows[0];
      } else {
        //return null when no assessments are associated with that id
        return null;
      }
     })
     .catch(err => null);
};

module.exports = { getCoreValuesAssessmentsById, addCoreValuesAssessmentById };