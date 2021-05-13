const express = require('express');
const router = express.Router();


module.exports = (db, bcrypt) => {

  router.post('/', (req, res) => {
    const {email, password} = req.body;
    
    if (email && password) {
      db.validateUser(email, password, bcrypt)
      .then((user)=>{
        if (user) {
          const {id, first_name, last_name, is_admin} = user;
          req.session.userId = id; 
          res.send({first_name, last_name, is_admin}).status(200);
        } else {
          res.sendStatus(401);
        }
      })
    } else {
      res.sendStatus(400);
    }
  });

  router.delete('/', (req, res) => {
    if (req.session.userId) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  });

  return router;

}
