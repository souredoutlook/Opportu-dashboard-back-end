const express = require('express');
const router = express.Router();
const { validateRankedValues } = require('../helpers/validations');

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

    //check session
    if (userId) {
      db.getValuesAssessmentById(assessment_id)
      .then(core_values_assessment => {
        if (core_values_assessment) {
          const { user_id, id, created, completed } = core_values_assessment;
          if (userId === user_id && completed === null) {
            res.send({ id, created }).status(200);
          } else if (userId === user_id) {
            //assessment has already been completed
            res.sendStatus(401);
          } else {
            //assessment is not associated with  the authenticated user
            res.sendStatus(403);
          }
        } else {
          //assessment_id doesn't exist
          res.sendStatus(404);
        }
      })

    } else {
      //no session
      res.sendStatus(401);
    }
  });

  router.put('/values/:assessment_id', function(req, res) {
    const userId = req.session && req.session.userId;
    const {assessment_id} = req.params;
    const { values } = req.body;

    //check session
    if (userId) {
      db.getValuesAssessmentById(assessment_id)
      .then(core_values_assessment => {
        if (core_values_assessment) {
          const { user_id, id, created, completed } = core_values_assessment;
          if (userId === user_id && completed === null) {
            if (validateRankedValues(values)) {
              db.addRankedValues(assessment_id, values)
                .then(rows => {
                  if (rows) {
                    db.updateValuesAssessmentById(assessment_id)
                    .then(row => {
                      if (row) {
                        res.send({...row}).status(200);
                      } else {
                        res.sendStatus(400);
                      }
                    })
                  } else {
                    res.sendStatus(400);
                  }
                })
            } else {
              res.sendStatus(400);
            }
          } else if (userId === user_id) {
            //assessment has already been completed
            res.sendStatus(401);
          } else {
            //assessment is not associated with  the authenticated user
            res.sendStatus(403);
          }
        } else {
          //assessment_id doesn't exist
          res.sendStatus(404);
        }
      })

    } else {
      //no session
      res.sendStatus(401);
    }
  });

  router.post('/facets', function(req, res) {
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
           db.addFacet5AssessmentById(id)
            .then(facet_5_assessment_id => {
              if (facet_5_assessment_id) {
                res.send(facet_5_assessment_id).status(200);
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
  



  return router;
};