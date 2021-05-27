const db = require("../pool")

/**
 * Returns user details for all users
 * @returns array of objects representing user details
 */
const getUsers = function() {
  const queryParams = [];
  const queryString = `
    SELECT users.id as id, first_name, last_name, email, teams.name as team_name, teams.id as team_id, groups.name as group_name, groups.id as group_id
    FROM users
    FULL OUTER JOIN assignments on users.id = user_id
    FULL OUTER JOIN teams on team_id = teams.id
    FULL OUTER JOIN groups on group_id = groups.id;
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

 /**
 * Returns user with matching id
 * @param {number} id 
 * @returns an object representing user with id that equals given argument
 */
const getUserById = function(id) {
  const queryParams = [id];
  const queryString = `
  SELECT *
  FROM users
  WHERE id = $1;
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

 /**
  * Insert a user with valid information into the database.
  * @param {string} first_name 
  * @param {string} last_name 
  * @param {string} email 
  * @param {string} password 
  * @returns {object} returns a new user object
  */
 const addUser = function(first_name, last_name, email, password) {
   const queryParams = [first_name, last_name, email, password];
   const queryString = `
    INSERT INTO users (first_name, last_name, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
   `;

   return db.query(queryString, queryParams)
    .then(res => {
      return res.rows[0];
    })
 }

  /**
  * Alter a user's password
  * @param {number} id
  * @param {string} password
  * @returns {object} returns an updated user object
  */
   const alterPassword= function(id, password) {
    const queryParams = [id, password];
    const queryString = `
    UPDATE users
    SET password = $2
    WHERE id = $1
    RETURNING *;
    `;
 
    return db.query(queryString, queryParams)
     .then(res => {
      if (res.rows.length > 0) {
        //validations should ensure that only one result is possible
        return res.rows[0];
      } else {
        //return null when no user is found at that id
        return null;
      }
     })
  }

module.exports = { getUsers, getUserByEmail, getUserById, addUser, alterPassword }
