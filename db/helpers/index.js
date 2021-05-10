//index.js -> all of the data helpers flow through this file

const { getUsers, getUserByEmail, getUserById, addUser, alterPassword } = require("./users")

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
 * @param {string} first_name 
 * @param {string} last_name 
 * @param {string} email 
 * @param {string} password 
 * @param {bcrypt} bcrypt dependency
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

/**
 * Validates uniqueness of email in db and then calls addUser if valid
 * @param {number} id
 * @param {string} old_password 
 * @param {string} new_password
 * @param {bcrypt} bcrypt dependency
 * @returns addUser query promise
 */
 const updatePassword = function(id, old_password, new_password, bcrypt) {
  return getUserById(id)
    .then(res => {
      if (res && bcrypt.compareSync(old_password, res.password)) {
        const encryptedPassword = bcrypt.hashSync(new_password, 10);
        return alterPassword(id, encryptedPassword);
      } else {
        //invalid id or wrong password
        return null;
      }
    })
};
exports.updatePassword = updatePassword;

// --- users ---
exports.getUsers = getUsers;