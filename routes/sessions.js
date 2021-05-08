const express = require('express');
const router = express.Router();


module.exports = (db, bcrypt) => {

  router.post('/new', (req, res) => {
    const {email, password} = req.body;
    
    if (email && password) {
      db.validateUser(email, password, bcrypt)
      .then((isValid)=>{
        if (isValid) {
          res.sendStatus(200);
        } else {
          res.sendStatus(401)
        }
      })
    } else {
      res.sendStatus(400);
    }
  });

  return router;

}
