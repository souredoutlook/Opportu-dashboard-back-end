// test/index.js

const request = require('supertest');
const session = require('supertest-session');
const app = require('../bin/server');
const assert = require('assert');

const userSession = session(app);
const adminSession = session(app);

const reset = require('../db/helpers/dbReset');
const divider = require('./.divider');

reset();

describe('All routes', function() {

  before(function() {
    divider();
  });

  //setup authenticated session
  before(function(done) {
    userSession.post('/sessions')
    .send({"email": "nicholas@meisen.haus", "password": "password"})
    .expect(200)
    .end(function (err) {
      if (err) return done(err);
      return done();
    });
  });
  
  //setup authenticated admin session
  before(function(done) {
    adminSession.post('/sessions')
    .send({"email": "nicholas@opportu.com", "password": "password"})
    .expect(200)
    .end(function (err) {
      if (err) return done(err);
      return done();
    });
  });

  after((done) => {
    app.close(done);
  });
  
  describe('Index Router', function() {

    before(function() {
      divider();
    });

    describe('GET /', function() {
      
      it('responds with "Hello world"', function(done) {
        request(app)
        .get('/')
        .expect(200, "Hello world", done)
      });
      
    });
    
  });
  
  describe("Session Router", function() {

    before(function() {
      divider();
    });

    describe('GET /sessions', function() {
      
      it('responds 400 when request is without credentials', function(done) {
        request(app)
        .post('/sessions')
        .expect(400, done);
      });
      
      it('responds 401 if credentials if email is invalid', function(done) {
        request(app)
        .post('/sessions')
        .send({"email": "not@valid.email", "password": "potato"})
        .expect(401, done);
      });
      
      it('responds 401 if password is invalid', function(done) {
        request(app)
        .post('/sessions')
        .send({"email": "nicholas@meisen.haus", "password": "potato"})
        .expect(401, done);
      });
      
      it('responds 200 if credentials are valid', function(done) {
        request(app)
        .post('/sessions')
        .send({"email": "nicholas@meisen.haus", "password": "password"})
        .expect(200, done);
      });
      
    });
    
    describe('DELETE /sessions', function() {
      
      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .delete('/sessions')
        .expect(401, done);
      });
      
      it('responds 200 if session.userId is not undefined', function(done) {
        userSession.delete('/sessions')
        .expect(200, done);
      })
      
    });

  });
  
  describe('User Router', function() {

    before(function() {
      divider();
    });

    describe('POST /users', function() {
      
      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .post('/users')
        .expect(401, done);
      });

      it('responds 401 if session.userId is not undefined and user does not have admin privileges', function(done) {
        userSession.post('/users')
        .expect(401, done);
      });

      it('responds 400 if session.userId is not undefined and user is an admin but request email is invalid', function(done) {
        adminSession.post('/users')
        .send({first_name: "Test", last_name: "McTestFace", email: "not@valid", password: "password"})
        .expect(400, done);
      });

      it('responds 400 if session.userId is not undefined and user is an admin but request email is invalid', function(done) {
        adminSession.post('/users')
        .send({first_name: "Test", last_name: "McTestFace", email: "valid@email.com", password: "psswrd"})
        .expect(400, done);
      });

      //insert user in db
      it('responds 200 if request is valid and returns the user', function(done) {
        adminSession.post('/users')
        .send({first_name: "Test", last_name: "McTestFace", email: "valid@email.com", password: "password"})
        .expect(200)
        .then(response => {
          const {first_name, last_name} = response.body;
          assert(first_name === "Test");
          assert(last_name === "McTestFace");
          done();
        })
      });

      it('responds 400 if request is valid and but user email is not unique', function(done) {
        adminSession.post('/users')
        .send({first_name: "Test", last_name: "McTestFace", email: "valid@email.com", password: "password"})
        .expect(400, done);
      });

    });

    describe('PUT /users/:user_id', function() {

    });
    
    describe('GET /users', function() {
      
      it('responds with an array with a length of 1 or greater', function(done) {
        request(app)
        .get('/users')
        .expect(200)
        .then(response => {
          assert(response.body instanceof Array);
          assert(response.body.length >= 1);
          done();
        })
        .catch(err => done(err));
      });
      
    });

  });
  
});