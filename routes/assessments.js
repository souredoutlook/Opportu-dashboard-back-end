const express = require('express');
const router = express.Router();

module.exports = (db) => {

  router.post('/values', function(req, res) {
    const userId = req.session && req.session.userId;
    const id = req.body.userId;
    
    //check session
    if (userId) {
      //check if user is admin
      db.isAdmin(userId)
      .then(isAdmin => {
        if (isAdmin) {
         // if they are admin
         if (id) {
           db.addCoreValuesAssessmentById(id)
            .then(core_values_assessment_id => {
              if (core_values_assessment_id) {
                res.send(core_values_assessment_id).status(200);
              } else {
                //no user at the provided id
                res.sendStatus(400);
              }
            });
         } else {
           // no id provided
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

  router.get('/values/:assessment_id', function(req, res) {
    const userId = req.session && req.session.userId;
    const {assessment_id} = req.params;
    console.log(assessment_id)
    //check session
    if (userId) {
      

    } else {
      //no session
      res.sendStatus(401);
    }
  });

  return router;
};