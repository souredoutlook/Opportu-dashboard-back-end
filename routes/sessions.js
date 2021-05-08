const e = require('express');
const express = require('express');
const router = express.Router();


module.exports = () => {

  router.post('/new', (req, res) => {
    const {email, password} = req.body;
    
    if (email && password) {
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  });

  return router;

}
