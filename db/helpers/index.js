//index.js -> all of the data helpers flow through this file

const { getUsers, getUserByEmail, getUserById, addUser } = require("./users")

/**
 * Compares password to hashed password in db for user with a given email
 * @param {string} email 
 * @param {string} password 
 * @returns 
 */
const validateUser = function(email, password, bcrypt) {
  return getUserByEmail(email)
    .then(res => {
      if (res && bcrypt.compareSync(password, res.password)) {
        return res.id
      } else {
        return null;
      }
    });

};
exports.validateUser = validateUser;

const isAdmin = function(id) {
  return getUserById(id)
    .then(res => {
      if(res) {
        if (res.is_admin === true) {
          return true
        } else {
          return false
        }
      } else {
        return null
      }
    });
};
exports.isAdmin = isAdmin;

/**
 * Validates uniqueness of email in db and then calls addUser if valid
 * @param {*} first_name 
 * @param {*} last_name 
 * @param {*} email 
 * @param {*} password 
 * @returns addUser query promise
 */
const addUserIfUnique = function(first_name, last_name, email, password, bcrypt) {

  return getUserByEmail(email)
    .then(res => {
      if (res) {
        return null
      } else {
        const encryptedPassword = bcrypt.hashSync(password, 10);
        return addUser(first_name, last_name, email, encryptedPassword);
      }
    })
};
exports.addUserIfUnique = addUserIfUnique;

// --- users ---
exports.getUsers = getUsers;