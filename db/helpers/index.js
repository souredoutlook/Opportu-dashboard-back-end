//index.js -> all of the data helpers flow through this file

const { getUsers, getUserByEmail } = require("./users")

/**
 * Compares password to hashed password in db for user with a given email
 * @param {string} email 
 * @param {string} password 
 * @returns 
 */
const validateUser = function(email, password, bcrypt) {
  return getUserByEmail(email)
    .then(row => {

      if (row && bcrypt.compareSync(password, row.password)) {
        return row.id
      } else {
        return null;
      }

    });

};
exports.validateUser = validateUser;

// --- users ---
exports.getUsers = getUsers;

// $2b$10$dZzQQWiYPHW6cBnsG2bG3OcAbn9OALv16IfcYiiDC/GnphwiDlSQO