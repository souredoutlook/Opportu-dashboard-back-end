const express = require('express');
const router = express.Router();

module.exports = (db) => {

  router.post('/', function(req, res) {
    const userId = req.session && req.session.userId;
    //check session
    if (userId) {
      //check if user is admin
      db.isAdmin(userId)
      .then(isAdmin => {
        if (isAdmin) {
          const { userId, teamId } = req.body;
          if (userId && teamId) {
            db.addAssignment(userId, teamId)
            .then(newAssignment => {
              if (newAssignment) {
                res.send({...newAssignment}).status(200);
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

  return router;

};