const express = require('express');
const router = express.Router();

module.exports = (db) => {

  router.post('/', function(req, res) {
    const userId = req.session && req.session.userId;
    const { name, description } = req.body;
    //check session
    if (userId) {
      //check if user is admin
      db.isAdmin(userId)
      .then(isAdmin => {
        if (isAdmin) {
          if (name && description) {
            db.addGroupIfUnique(name, description)
            .then(newGroup => {
              if (newGroup) {
                res.send({...newGroup}).status(200);
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

  router.get('/', function(req, res) {
    const userId = req.session && req.session.userId;

    //check session
    if (userId) {
      //check if user is admin
      db.isAdmin(userId)
      .then(isAdmin => {
        if (isAdmin) {
          db.getGroups()
          .then((rows)=>{
            res.send(rows);
          });
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