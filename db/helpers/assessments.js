const db = require('../pool');

const getCoreValuesById = function(id) {

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
      if (res.rows.length !== 0) {
        return res.rows;
      } else {
        //return null when no assessments are associated with that id
        return null;
      }
     })
};

module.exports = { getCoreValuesById };