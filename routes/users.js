const express = require('express');
const router = express.Router();
const { validateEmail, validatePassword } = require('../helpers/index');

module.exports = (db, bcrypt) => {

  router.post('/', function(req, res) {
    const userId = req.session && req.session.userId;
    const { first_name, last_name, email, password } = req.body;
    //check session
    if (userId) {
      //check if user is admin
      db.isAdmin(userId)
      .then(isAdmin => {
        if (isAdmin) {
          if (validateEmail(email) && validatePassword(password) && first_name && last_name) {
            db.addUserIfUnique(first_name, last_name, email, password, bcrypt)
            .then(newUser => {
              if (newUser) {
                res.send(newUser).status(200);
              } else {
                //email is valid but not unique
                res.sendStatus(400);
              }
            })
            .catch(err => res.send(err).status(400));
          } else {
            res.sendStatus(400);
          }
        } else {
          //not admin
          res.sendStatus(401);
        }
      });
    } else {
      //no session
      res.sendStatus(401);
    }
  });

  router.get('/', function(req, res) {
    
    db.getUsers()
    .then((rows)=>{
      res.send(rows);
    });

  });

  return router;

};