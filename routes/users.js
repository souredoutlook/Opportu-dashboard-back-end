const express = require('express');
const router = express.Router();


module.exports = (db) => {

  router.get('/', function(req, res, next) {
    
    db.getUsers()
    .then((rows)=>{
      res.send(rows);
    });

  });

  return router;

};