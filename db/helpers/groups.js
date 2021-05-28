const db = require("../pool")

 /**
  * Insert a group with valid info into the database if unique
  * @param {string} name
  * @param {string} description
  * @returns {object} returns a new group object
  */
 const addGroupIfUnique = function(name, description) {
   const queryParams = [name, description, name];
   const queryString = `
    INSERT INTO groups (name, description)
    SELECT $1, $2
    WHERE NOT EXISTS (
      SELECT 1 FROM groups WHERE name = $3
    )
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
 * Returns group details for all groups
 * @returns array of objects representing user details
 */
const getGroups = function() {
  const queryParams = [];
  const queryString = `
    SELECT groups.name as group_name, groups.id as group_id
    FROM groups;
  `;

  return db.query(queryString, queryParams)
    .then((res) => {
      return res.rows;
    })
};

 module.exports = { addGroupIfUnique, getGroups };