const express = require('express');
const router = express.Router();
const { validateEmail, validatePassword } = require('../helpers/validations');

module.exports = (db, bcrypt) => {

  router.post('/values', function(req, res) {
    const userId = req.session && req.session.userId;
    
    //check session
    if (userId) {
      //check if user is admin
      db.isAdmin(userId)
      .then(isAdmin => {
        if (isAdmin) {
         // if they are admin
        } else {
          //not admin
          res.sendStatus(403);
        }
      });
    } else {
      //no session
      res.sendStatus(401);
    }
  });

  return router;
};