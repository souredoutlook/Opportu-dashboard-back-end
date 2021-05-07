const db = require("../pool")

/**
 * A function that returns user details for all users
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

module.exports = { getUsers }
