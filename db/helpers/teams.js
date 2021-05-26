const db = require("../pool")

 /**
  * Insert a group with valid info into the database if unique
  * @param {string} name
  * @param {string} description
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

 module.exports = { addTeam };