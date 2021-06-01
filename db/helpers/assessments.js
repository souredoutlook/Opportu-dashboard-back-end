const db = require('../pool');

const getCoreValuesAssessmentsById = function(id) {

  const queryParams = [id];
  const queryString = `
    SELECT completed, user_id, assessment_id, core_value, name as custom_value, rank, aggregate_assessment_id
    FROM values_assessments
    JOIN ranked_values ON values_assessments.id = assessment_id
    FULL OUTER JOIN custom_values ON custom_value_id = custom_values.id
    WHERE user_id = $1
    ORDER BY completed DESC, assessment_id, rank;
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

/**
 * Get an assessment by assessment_id
 * @param {number} id 
 * @returns {object} returns assessment object
 */
const getValuesAssessmentById = function(id) {
  const queryParams = [id]
  const queryString = `
    SELECT *
    FROM values_assessments
    WHERE id = $1;
  `;

  return db.query(queryString, queryParams)
     .then(res => {
      if (res.rows && res.rows.length > 0) {
        //constraints should ensure that only one row is returned
        return res.rows[0];
      } else {
        //return null when no assessments are associated with that id
        return null;
      }
     })
     .catch(err => null);
};

const addCustomValue = function(customValue) {

  const queryParams = [customValue];
  const queryString = `
    INSERT INTO custom_values (name)
    VALUES ($1)
    RETURNING *;
  `;

  return db.query(queryString, queryParams)
    .then(res => {
      if (res.rows && res.rows.length > 0) {
        //constraints should ensure that only one row is returned
        return res.rows[0];
      } else {
        //return null when custom value is invalid
        return null;
      }
    })

};

const updateValuesAssessmentById = function(assessment_id) {
  const queryParams = [assessment_id];
  const queryString = `
    UPDATE values_assessments
    SET completed = NOW()::TIMESTAMP
    WHERE id = $1
    RETURNING *;
  `
  return db.query(queryString, queryParams)
    .then(res => {
      if (res.rows && res.rows.length > 0) {
        //constraints should ensure that only one row is returned
        return res.rows[0];
      } else {
        //return null when assessment_id is invalid
        return null;
      }
    })
    .catch(err => null);
}

/**
 * Creates a new facet_5_assessment for the specified user if they do not already have a facet5assessment
 * @param {number} id of user 
 * @returns {number} returns a facet_5_assessment_id or null if the given user_id is not valid
 */
 const addFacet5AssessmentById = function(id) {
  const queryParams = [id]
  const queryString = `
  INSERT INTO facet_5_assessments (user_id)
  SELECT $1
  WHERE NOT EXISTS (
    SELECT 1 FROM facet_5_assessments WHERE user_id = $1
  )
  RETURNING *;
  `;

  return db.query(queryString, queryParams)
     .then(res => {
      if (res.rows && res.rows.length > 0) {
        return res.rows[0];
      } else {
        //return null when the user already has a facet 5 assessment
        return null;
      }
     })
     .catch(err => null);
};

/**
 * Get a facet 5 assessment by assessment_id or user_id
 * @param {number} id 
 * @param {boolean} byUser, defaults to false 
 * @returns {object} returns assessment object
 */
 const getFacet5AssessmentById = function(id, byUser = false) {
  const condition = byUser ? 'user_id' : 'id';
  const queryParams = [id]
  const queryString = `
    SELECT *
    FROM facet_5_assessments
    WHERE ${condition} = $1;
  `;

  return db.query(queryString, queryParams)
     .then(res => {
      if (res.rows && res.rows.length > 0) {
        //constraints should ensure that only one row is returned
        return res.rows[0];
      } else {
        //return null when no assessments are associated with the relevant id
        return null;
      }
     })
     .catch(err => null);
};

const updateFacet5AssessmentById = function(assessment_id, facets) {
  const { will, energy, control, emotionality, affection } = facets;
  const queryParams = [assessment_id, will, energy, control, emotionality, affection];
  const queryString = `
    UPDATE facet_5_assessments
    SET completed = NOW()::TIMESTAMP, will = $2, energy = $3, control = $4, emotionality = $5, affection = $6
    WHERE id = $1
    RETURNING *;
  `
  return db.query(queryString, queryParams)
    .then(res => {
      if (res.rows && res.rows.length > 0) {
        //constraints should ensure that only one row is returned
        return res.rows[0];
      } else {
        //return null when assessment_id is invalid
        return null;
      }
    })
    .catch(err => null);
}
module.exports = { getCoreValuesAssessmentsById, addCoreValuesAssessmentById, getValuesAssessmentById, addCustomValue, updateValuesAssessmentById, addFacet5AssessmentById, getFacet5AssessmentById, updateFacet5AssessmentById };