const db = require('../pool');

const { aggregate_assessment_reducer } = require('../../helpers/reducers');

/**
 * Creates a new aggregate_assessment that references either a group_id or a team_id
 * @param {number} groupId or null
 * @param {number} teamId or null
 * @returns {object} returns an aggregateAssessmentObject
 */
 const addAggregateAssessmentById= function(groupId, teamId) {
  const queryParams = [groupId, teamId]
  const queryString = `
  INSERT INTO aggregate_assessments (group_id, team_id)
  VALUES ($1, $2)
  RETURNING *;
  `;

  return db.query(queryString, queryParams)
     .then(res => {
      if (res.rows && res.rows.length > 0) {
        return res.rows[0];
      } else {
        //return null when the groupId or teamId does not exist
        return null;
      }
     })
     .catch(err => null);
     //return null when the groupId or teamId is an invalid type
};

const getAggregateAssessmentResultsById = function(id) {
  const queryParams = [id]
  const queryString = `
    SELECT core_value, custom_values.name AS custom_value
    FROM aggregate_assessments
    LEFT JOIN values_assessments ON values_assessments.aggregate_assessment_id = aggregate_assessments.id
    LEFT JOIN ranked_values ON values_assessments.id = assessment_id
    LEFT JOIN custom_values ON custom_value_id = custom_values.id
    WHERE values_assessments.completed IS NOT NULL AND aggregate_assessment_id = $1;
  `;

  return db.query(queryString, queryParams)
     .then(res => {
       if (res.rows && res.rows.length > 0) {
        return aggregate_assessment_reducer(res.rows);
      } else {
        //return null when the aggregate_assessment_id does not exist
        return null;
      }
     })
     .catch(err => null);
     //return null when the id's type is invalid
}

module.exports = { addAggregateAssessmentById, getAggregateAssessmentResultsById };