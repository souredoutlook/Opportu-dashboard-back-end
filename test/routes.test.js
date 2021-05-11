// test/index.js

const request = require('supertest');
const session = require('supertest-session');
const app = require('../bin/server');
const assert = require('assert');

const userSession = session(app);
const idUser = 1;
const adminSession = session(app);
const idAdmin = 2;

const reset = require('../db/helpers/dbReset');
const divider = require('./.divider');
const { expect } = require('chai');

//reset db for tests
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

      before(function() {
        divider();
      });
      
      it('responds with "Hello world"', function(done) {
        request(app)
        .get('/')
        .expect(200, "Hello world", done)
      });
      
    });
    
  });
  
  describe("Sessions Router", function() {

    before(function() {
      divider();
    });

    describe('GET /sessions', function() {

      before(function() {
        divider();
      });
      
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

      before(function() {
        divider();
      });
      
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
  
  describe('Users Router', function() {

    before(function() {
      divider();
    });

    describe('POST /users', function() {

      before(function() {
        divider();
      });
      
      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .post('/users')
        .expect(401, done);
      });

      it('responds 403 if session.userId does not have admin privileges', function(done) {
        userSession.post('/users')
        .expect(403, done);
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
      it('responds 403 if session.userId is undefined', function(done) {
        request(app)
        .put(`/users/${idUser}`)
        .expect(403, done);
      });

      it('responds 403 if session.userId does not equal req.params.userId', function(done) {
        adminSession.put(`/users/${idUser}`)
        .expect(403, done);
      });

      it('responds 400 if session.userId == params.userId and old_password is undefined', function(done) {
        userSession.put(`/users/${idUser}`)
        .send({new_password: "mynewpassword"})
        .expect(400, done);
      });

      it('responds 400 if session.userId == params.userId and old_password is invalid', function(done) {
        userSession.put(`/users/${idUser}`)
        .send({old_password: "", new_password: "mynewpassword"})
        .expect(400, done);
      })

      it('responds 400 if session.userId == params.userId and new_password is undefined', function(done) {
        userSession.put(`/users/${idUser}`)
        .send({old_password: "password"})
        .expect(400, done);
      });

      it('responds 400 if session.userId == params.userId and new_password is invalid', function(done) {
        userSession.put(`/users/${idUser}`)
        .send({old_password: "password", new_password: ""})
        .expect(400, done);
      })

      it('responds 401 if old_password is valid but does not match the password in the database', function(done) {
        userSession.put(`/users/${idUser}`)
        .send({old_password: "mynewpassword", new_password: "mynewpassword"})
        .expect(401, done);
      });

      it('responds 200 if old_password is correct and inserts new password in the database', function(done) {
        userSession.put(`/users/${idUser}`)
        .send({old_password: "password", new_password: "mynewpassword"})
        .expect(200, done);
      });

    });

    describe('GET /users/:user_id/assessments', function() {

      before(function() {
        divider();
      });

      it('responds 403 if session.userId is undefined', function(done) {
        request(app)
        .get(`/users/${idUser}/assessments`)
        .expect(403, done);
      });

      it('responds 403 if session.userId does not equal req.params.userId', function(done) {
        adminSession.get(`/users/${idUser}/assessments`)
        .expect(403, done);
      });

      it('responds 200 if session.userId == params.userId and response.body.assessments lacks core_values key when user has no core_values assessments', function(done) {
        adminSession.get(`/users/${idAdmin}/assessments`)
        .expect(200)
        .then(response => {
          const { core_values } = response.body.assessments;
          assert(core_values === undefined);
          done();
        })
        .catch(err => done(err));
      });

      it('responds 200 if session.userId == params.userId and response.body.assessments contains a core_values object whose keys contain arrays of length 10', function(done) {
        userSession.get(`/users/${idUser}/assessments`)
        .expect(200)
        .then(response => {
          const { core_values } = response.body.assessments;
          assert(core_values instanceof Object);
          assert(core_values[Object.keys(core_values)[0]].length === 10);
          done();
        })
        .catch(err => done(err));
      });
    });
    
    describe('GET /users', function() {

      before(function() {
        divider();
      });
      
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

  describe('Assessments Router', function() {

    before(function() {
      divider();
    });

    describe('POST /assessments/values', function() {

      before(function() {
        divider();
      });

      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .post('/assessments/values')
        .expect(401, done);
      });

      it('responds 403 if session.userId does not have admin privileges', function(done) {
        userSession.post('/assessments/values')
        .expect(403, done);
      });

      it('responds 400 if the user has admin privileges but there is no specified userId', function(done) {
        adminSession.post('/assessments/values')
        .send({})
        .expect(400, done);
      });

      it('responds 400 if the user has admin privileges but the userId is not valid', function(done) {
        adminSession.post('/assessments/values')
        .send({userId: "potato"})
        .expect(400, done);
      });

      it('responds 400 if the user has admin privileges but the userId is not valid', function(done) {
        adminSession.post('/assessments/values')
        .send({userId: 0})
        .expect(400, done);
      });

      it('responds 200 if the user has admin privileges and the userId is valid, returns a new assessment_id', function(done) {
        adminSession.post('/assessments/values')
        .send({userId: 1})
        .expect(200)
        .then(response => {
          const {id} = response.body;
          expect(id !== undefined);
          done();
        });
      });

    })

    describe.only('GET /assessments/values/:assessment_id', function() {

      before(function() {
        divider();
      });

      //check session - 401
 
      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .get('/assessments/values/3')
        .expect(401, done);
      });
      
      it('responds 404 if assessment_id is invalid', function(done) {
        adminSession.get('/assessments/values/potato')
        .expect(404, done);
      });

      it('responds 404 if assessment_id is valid but does not exist', function(done) {
        adminSession.get('/assessments/values/3')
        .expect(404, done);
      });

      it('responds 403 if assessment_id is associated with another user', function(done) {
        adminSession.get('/assessments/values/1')
        .expect(403, done);
      });

      it('responds 401 if assessment_id is associated with an assessment that the user already completed', function(done) {
        userSession.get('/assessments/values/1')
        .expect(401, done);
      });

      it('responds 200 if assessment is associated with authenticated user and incomplete, returns assessment_id and creation timestamp', function(done) {
        userSession.get('/assessments/values/2')
        .expect(200)
        .then(response => {
          const { id, created } = response && response.body;
          expect(id instanceof Number);
          expect(created instanceof Date);
          done();
        })
      });
      
    });

  });
  
});