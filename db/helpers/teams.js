const db = require("../pool")

 /**
  * Insert a team with valid info into the database
  * @param {string} name
  * @param {string} description
  * @param {number} group_id
  * @returns {object} returns a team object
  */
 const addTeam = function(name, description, group_id) {
   const queryParams = [name, description, group_id];
   const queryString = `
    INSERT INTO teams (name, description, group_id)
    SELECT $1, $2, $3
    RETURNING *;
   `;

   return db.query(queryString, queryParams)
    .then(res => {
      if (res.rows) {
        return res.rows[0];
      } else {
        //not unique
        return null;
      }
    })
    .catch(err => {
      return null
    })
 }

 /**
 * Returns team details for all teams
 * @returns array of objects representing user details
 */
const getTeams = function() {
  const queryParams = [];
  const queryString = `
    SELECT teams.name as team_name, teams.id as team_id, groups.name as group_name, groups.id as group_id
    FROM teams
    JOIN groups on group_id = groups.id;
  `;

  return db.query(queryString, queryParams)
    .then((res) => {
      return res.rows;
    })
};

 module.exports = { addTeam, getTeams };