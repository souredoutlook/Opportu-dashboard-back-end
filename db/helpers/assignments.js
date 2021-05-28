const db = require("../pool")

/**
* 
* @param {number} userId
* @param {number} teamId
* @returns {object} returns an assignment object
*/
const addAssignment = function(userId, teamId) {
  const queryParams = [userId, teamId];
  const queryString = `
  INSERT INTO assignments (user_id, team_id)
  VALUES ($1, $2)
  RETURNING *;
  `;

  return db.query(queryString, queryParams)
  .then(res => {
    if (res.rows) {
      return res.rows[0];
    } else {
      //reference ids are not valid
      return null;
    }
  })
  .catch(err => {
    return null
  })
};

 module.exports = { addAssignment };