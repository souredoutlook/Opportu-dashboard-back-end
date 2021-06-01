const db = require('../pool');

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

module.exports = { addAggregateAssessmentById };