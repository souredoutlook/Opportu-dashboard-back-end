const express = require('express');
const router = express.Router();
const { validateEmail, validatePassword } = require('../helpers/validations');

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
          if (email && validateEmail(email) && password && validatePassword(password) && first_name && last_name) {
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
            //invalid request
            res.sendStatus(400);
          }
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

  router.put('/:userId', function(req, res) {
    const userId = req.session && req.session.userId;
    const { old_password, new_password} = req.body;
    const paramId = Number(req.params.userId);

    //check session
    if (userId && userId === paramId) {
      //check request to ensure all data is present and valid
      if (old_password && validatePassword(old_password) && new_password && validatePassword(new_password)) {
        //check old_password against db and, if matching, insert new_password
        db.updatePassword(userId, old_password, new_password, bcrypt)
        .then(success => {
          if (success) {
            res.sendStatus(200);
          } else {
            //invalid userId or old_password was not correct
            res.sendStatus(401);
          }
        })
      } else {
        res.sendStatus(400);
      }
    } else {
      // no session || session is not authorized for this resource
      res.sendStatus(403);
    }

  });

  router.get('/:userId/assessments', function(req, res) {
    const userId = req.session && req.session.userId;
    const paramId = Number(req.params.userId);

    //check session
    if (userId && userId === paramId) {
      //retrieve all assessments
      db.getAssessmentsByUserId(userId)
      .then(assessments => res.send({...assessments}).status(200));
    } else {
      // no session || session is not authorized for this resource
      res.sendStatus(403);
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