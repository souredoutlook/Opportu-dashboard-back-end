const db = require('../pool');

const getCoreValuesById = function(id) {

  const queryParams = [id];
  const queryParams = `
  SELECT user_id, assessment_id, core_value, name as custom_value, rank
  FROM values_assessments
  JOIN ranked_values ON values_assessments.id = assessment_id
  FULL OUTER JOIN custom_values ON custom_value_id = custom_values.id
  WHERE user_id = $1
  ORDER BY assessment_id, rank;
  `
};

module.exports = { getCoreValuesById };