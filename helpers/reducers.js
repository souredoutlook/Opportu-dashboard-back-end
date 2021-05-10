//helpers/reducers.js

const core_values_reducer = function(rows) {
  return rows.reduce((prev, cur)=> {
    const { assessment_id, core_value, custom_value } = cur;

    if (prev[assessment_id] === undefined) {
      prev[assessment_id] = [core_value || custom_value];
    } else {
      prev[assessment_id].push(core_value || custom_value);
    }

    return prev;
  },{});
};

module.exports = { core_values_reducer };