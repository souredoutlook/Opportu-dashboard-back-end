const db = require("../pool")

/**
 * Returns user details for all users
 * @returns array of objects representing user details
 */
const getUsers = function() {
  const queryParams = [];
  const queryString = `
    SELECT first_name, last_name, teams.name as team_name, groups.name as group_name
    FROM users
    JOIN assignments on users.id = user_id
    JOIN teams on team_id = teams.id
    JOIN groups on group_id = groups.id;
  `;

  return db.query(queryString, queryParams)
    .then((res) => {
      return res.rows;
    })
};

/**
 * Returns user with matching email
 * @param {string} email 
 * @returns an object representing user with email that equals given argument
 */
const getUserByEmail = function(email) {
  const queryParams = [email];
  const queryString = `
  SELECT *
  FROM users
  WHERE email = $1;
  `;

  return db.query(queryString, queryParams)
  .then((res) => {
    if (res.rows.length > 0) {
      //validations should ensure that only one result is possible
      return res.rows[0];
    } else {
      //return null when no user is found
      return null;
    }
  })
 }

module.exports = { getUsers, getUserByEmail }
