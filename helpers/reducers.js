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

const aggregate_assessment_reducer = function(rows) {
  return rows.reduce((prev, cur) => {
    const { core_value, custom_value } = cur;

    if (prev[core_value || custom_value] === undefined) {
      prev[core_value || custom_value] = 1;
    } else {
      prev[core_value || custom_value] += 1;
    }

    return prev;
  }, {});
};

module.exports = { core_values_reducer, aggregate_assessment_reducer };