//helpers/reducers.js

const core_values_reducer = function(rows) {
  return rows.reduce((prev, cur)=> {
    const { assessment_id, core_value, custom_value, completed, aggregate_assessment_id } = cur;
    
    if (!aggregate_assessment_id) {
      if (prev[assessment_id] === undefined) {
        prev[assessment_id] = {values: [core_value || custom_value], completed };
      } else {
        prev[assessment_id].values.push(core_value || custom_value);
      }
    }

    return prev;
  },{});
};

module.exports = { core_values_reducer };