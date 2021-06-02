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

    describe('POST /sessions', function() {

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
        .expect(200)
        .then(response => {
          const keys = Object.keys(response.body);
          expect(keys.length === 4);
          done();
        })
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

      it('responds 200 if session.userId == params.userId and response.body.assessment ore_va when user has no core_values assessments', function(done) {
        adminSession.get(`/users/${idAdmin}/assessments`)
        .expect(200)
        .then(response => {
          const { core_values } = response.body.assessments;
          assert(core_values === undefined);
          done();
        })
        .catch(err => done(err));
      });

      it('responds 200 if session.userId == params.userId and response.body.assessments contains a core_values object which contains an array of length 10', function(done) {
        userSession.get(`/users/${idUser}/assessments`)
        .expect(200)
        .then(response => {
          const { core_values } = response.body.assessments;
          assert(core_values instanceof Object);
          assert(core_values[Object.keys(core_values)[0]].values.length === 10);
          done();
        })
        .catch(err => done(err));
      });
    });
    
    describe('GET /users', function() {

      before(function() {
        divider();
      });
        
      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .get('/users')
        .expect(401, done);
      });

      it('responds 403 if session.userId does not have admin privileges', function(done) {
        userSession.get('/users')
        .expect(403, done);
      });
      
      it('responds with 200 and an array with a length of 1 or greater if session.userId has admin privileges', function(done) {
        adminSession
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

    describe('GET /assessments/values/:assessment_id', function() {

      before(function() {
        divider();
      });

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
        adminSession.get('/assessments/values/99')
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

    describe('PUT /assessments/values/:assessment_id', function(done) {

      before(function() {
        divider();
      });

      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .put('/assessments/values/3')
        .expect(401, done);
      });
      
      it('responds 404 if assessment_id is invalid', function(done) {
        adminSession.put('/assessments/values/potato')
        .expect(404, done);
      });

      it('responds 404 if assessment_id is valid but does not exist', function(done) {
        adminSession.put('/assessments/values/99')
        .expect(404, done);
      });

      it('responds 403 if assessment_id is associated with another user', function(done) {
        adminSession.put('/assessments/values/1')
        .expect(403, done);
      });

      it('responds 401 if assessment_id is associated with an assessment that the user already completed', function(done) {
        userSession.put('/assessments/values/1')
        .expect(401, done);
      });

      it('responds 400 if the assessment_id is valid and there are less than 10 values submitted', function(done) {
        userSession.put('/assessments/values/2')
        .send({
          values: [
            { value: 'Ambition', is_custom: false },
            { value: 'Authority', is_custom: false },
            { value: 'Autonomy', is_custom: false },
            { value: 'Beauty', is_custom: false },
            { value: 'Belonging', is_custom: false },
            { value: 'Boldness', is_custom: false },
            { value: 'Buoyancy', is_custom: false },
            { value: 'Calm', is_custom: false },
            { value: 'Celebrity/Fame', is_custom: false },
          ]
        })
        .expect(400, done);
      });

      it('responds 400 if the assessment_id is valid and there are more than 10 values submitted', function(done) {
        userSession.put('/assessments/values/2')
        .send({
          values: [
            { value: 'Ambition', is_custom: false },
            { value: 'Authority', is_custom: false },
            { value: 'Autonomy', is_custom: false },
            { value: 'Beauty', is_custom: false },
            { value: 'Belonging', is_custom: false },
            { value: 'Boldness', is_custom: false },
            { value: 'Buoyancy', is_custom: false },
            { value: 'Calm', is_custom: false },
            { value: 'Celebrity/Fame', is_custom: false },
            { value: 'Raditude', is_custom: true },
            { value: 'Certainty', is_custom: false },
          ]
        })
        .expect(400, done);
      });

      it('responds 400 if the assessment_id is valid and there is a duplicate non-custom value', function(done) {
        userSession.put('/assessments/values/2')
        .send({
          values: [
            { value: 'Ambition', is_custom: false },
            { value: 'Authority', is_custom: false },
            { value: 'Autonomy', is_custom: false },
            { value: 'Beauty', is_custom: false },
            { value: 'Belonging', is_custom: false },
            { value: 'Boldness', is_custom: false },
            { value: 'Buoyancy', is_custom: false },
            { value: 'Calm', is_custom: false },
            { value: 'Celebrity/Fame', is_custom: false },
            { value: 'Ambition', is_custom: false },
          ]
        })
        .expect(400, done);
      });

      it('responds 200 if the assessment_id is valid and the update is successful', function(done) {
        userSession.put('/assessments/values/2')
        .send({
          values: [
            { value: 'Ambition', is_custom: false },
            { value: 'Authority', is_custom: false },
            { value: 'Autonomy', is_custom: false },
            { value: 'Beauty', is_custom: false },
            { value: 'Belonging', is_custom: false },
            { value: 'Boldness', is_custom: false },
            { value: 'Buoyancy', is_custom: false },
            { value: 'Calm', is_custom: false },
            { value: 'Celebrity/Fame', is_custom: false },
            { value: 'Raditude', is_custom: true },
          ]
        })
        .expect(200, done);
      });
      
    });

    describe('POST /assessments/facets', function() {

      before(function() {
        divider();
      });

      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .post('/assessments/facets')
        .expect(401, done);
      });

      it('responds 403 if session.userId does not have admin privileges', function(done) {
        userSession.post('/assessments/facets')
        .expect(403, done);
      });

      it('responds 400 if the user has admin privileges but there is no specified userId', function(done) {
        adminSession.post('/assessments/facets')
        .send({})
        .expect(400, done);
      });

      it('responds 400 if the user has admin privileges but the userId is not valid', function(done) {
        adminSession.post('/assessments/facets')
        .send({userId: "potato"})
        .expect(400, done);
      });

      it('responds 400 if the user has admin privileges but the userId is not valid', function(done) {
        adminSession.post('/assessments/facets')
        .send({userId: 0})
        .expect(400, done);
      });

      it('responds 200 if the user has admin privileges and the userId is valid, returns a new assessment_id', function(done) {
        adminSession.post('/assessments/facets')
        .send({userId: 1})
        .expect(200)
        .then(response => {
          const {id} = response.body;
          expect(id !== undefined);
          done();
        });
      });

    })

    describe('PUT /assessments/facets/:assessment_id', function(done) {

      before(function() {
        divider();
      });

      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .put('/assessments/facets/2')
        .expect(401, done);
      });
      
      it('responds 404 if assessment_id is invalid', function(done) {
        adminSession.put('/assessments/facets/potato')
        .expect(404, done);
      });

      it('responds 404 if assessment_id is valid but does not exist', function(done) {
        adminSession.put('/assessments/facets/99')
        .expect(404, done);
      });

      it('responds 403 if assessment_id is associated with another user', function(done) {
        adminSession.put('/assessments/facets/2')
        .expect(403, done);
      });

      it('responds 401 if assessment_id is associated with an assessment that the user already completed', function(done) {
        adminSession.put('/assessments/facets/1')
        .expect(401, done);
      });

      it('responds 400 if the assessment_id is valid and there are less than 5 facets submitted', function(done) {
        userSession.put('/assessments/facets/2')
        .send({
          facets: {
            will: 10,
            energy: 10,
            control: 10,
            emotionality: 10,
          }
        })
        .expect(400, done);
      });

      it('responds 400 if the assessment_id is valid and there are more than 5 facets submitted', function(done) {
        userSession.put('/assessments/facets/2')
        .send({
          facets: {
            will: 10,
            energy: 10,
            control: 10,
            emotionality: 10,
            affection: 10,
            raditude: 10,
          }
        })
        .expect(400, done);
      });

      it('responds 400 if the assessment_id is valid but not all facets are valid', function(done) {
        userSession.put('/assessments/facets/2')
        .send({
          facets: {
            will: 10,
            energy: 10,
            control: 10,
            emotionality: 10,
            raditude: 10,
          }
        })
        .expect(400, done);
      });

      it('responds 200 if the assessment_id is valid and the update is successful', function(done) {
        userSession.put('/assessments/facets/2')
        .send({
          facets: {
            will: 10,
            energy: 10,
            control: 10,
            emotionality: 10,
            affection: 10,
          }
        })
        .expect(200, done);
      });
      
    });

  });

  describe('Groups Router', function() {

    before(function() {
      divider();
    });

    describe('POST /groups', function() {

      before(function() {
        divider();
      });
      
      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .post('/groups')
        .expect(401, done);
      });

      it('responds 403 if session.userId does not have admin privileges', function(done) {
        userSession.post('/groups')
        .expect(403, done);
      });

      it('responds 400 if session.userId is not undefined and user is an admin but no description is provided', function(done) {
        adminSession.post('/groups')
        .send({name: "Test"})
        .expect(400, done);
      });

      it('responds 400 if session.userId is not undefined and user is an admin but no name is provided', function(done) {
        adminSession.post('/groups')
        .send({description: "A very testy organization."})
        .expect(400, done);
      });

      it('responds 200 if request is valid and returns the id', function(done) {
        adminSession.post('/groups')
        .send({name: "Test", description: "A very testy organization."})
        .expect(200)
        .then(response => {
          const {id} = response.body;
          assert(id !== undefined);
          done();
        })
        .catch(err=>done(err));
      });

      it('responds 400 if request is valid and but user email is not unique', function(done) {
        adminSession.post('/groups')
        .send({name: "Test", description: "A very testy organization."})
        .expect(400, done);
      });

    });

    describe('GET /groups', function() {

      before(function() {
        divider();
      });
        
      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .get('/groups')
        .expect(401, done);
      });

      it('responds 403 if session.userId does not have admin privileges', function(done) {
        userSession.get('/groups')
        .expect(403, done);
      });
      
      it('responds with 200 and an array with a length of 1 or greater if session.userId has admin privileges', function(done) {
        adminSession
        .get('/groups')
        .expect(200)
        .then(response => {
          assert(response.body instanceof Array);
          assert(response.body.length >= 1);
          done();
        })
        .catch(err => done(err));
      });
      
    });

    describe('POST /groups/values', function() {

      before(function() {
        divider();
      });

      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .post('/groups/values')
        .expect(401, done);
      });

      it('responds 403 if session.userId does not have admin privileges', function(done) {
        userSession.post('/groups/values')
        .expect(403, done);
      });

      it('responds 400 if the user has admin privileges but there is no specified userId', function(done) {
        adminSession.post('/groups/values')
        .send({})
        .expect(400, done);
      });

      it('responds 400 if the user has admin privileges but the groupId is not valid', function(done) {
        adminSession.post('/groups/values')
        .send({groupId: "potato"})
        .expect(400, done);
      });

      it('responds 400 if the user has admin privileges but the groupId is not valid', function(done) {
        adminSession.post('/groups/values')
        .send({groupId: 0})
        .expect(400, done);
      });

      it('responds 200 if the user has admin privileges and the groupId is valid, returns a new group_assessment_id', function(done) {
        adminSession.post('/groups/values')
        .send({groupId: 1})
        .expect(200)
        .then(response => {
          const {aggregate_assessment_id} = response.body[0];
          expect(aggregate_assessment_id !== undefined);
          done();
        });
      });

    });

  });

  describe('Teams Router', function() {

    before(function() {
      divider();
    });

    describe('POST /teams', function() {

      before(function() {
        divider();
      });
      
      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .post('/teams')
        .expect(401, done);
      });

      it('responds 403 if session.userId does not have admin privileges', function(done) {
        userSession.post('/teams')
        .expect(403, done);
      });

      it('responds 400 if session.userId is not undefined and user is an admin but no description is provided', function(done) {
        adminSession.post('/teams')
        .send({name: 'The Testing Crew', group_id: 2})
        .expect(400, done);
      });

      it('responds 400 if session.userId is not undefined and user is an admin but no name is provided', function(done) {
        adminSession.post('/teams')
        .send({description: 'Here to test the app', group_id: 2})
        .expect(400, done);
      });
      
      it('responds 400 if session.userId is not undefined and user is an admin but no group_id is provided', function(done) {
        adminSession.post('/teams')
        .send({name: 'The Testing Crew', description: 'Here to test the app'})
        .expect(400, done);
      });

      it('responds 400 if session.userId is not undefined and user is an admin but the group_id that is provided does not exist', function(done) {
        adminSession.post('/teams')
        .send({name: 'The Testing Crew', description: 'Here to test the app', group_id: 3})
        .expect(400, done);
      });

      it('responds 200 if request is valid and returns the id', function(done) {
        adminSession.post('/teams')
        .send({name: 'The Testing Crew', description: 'Here to test the app', group_id: 2})
        .expect(200)
        .then(response => {
          const {id} = response.body;
          assert(id !== undefined);
          done();
        })
        .catch(err=>done(err));
      });


    });

    describe('GET /teams', function() {

      before(function() {
        divider();
      });
        
      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .get('/teams')
        .expect(401, done);
      });

      it('responds 403 if session.userId does not have admin privileges', function(done) {
        userSession.get('/teams')
        .expect(403, done);
      });
      
      it('responds with 200 and an array with a length of 1 or greater if session.userId has admin privileges', function(done) {
        adminSession
        .get('/teams')
        .expect(200)
        .then(response => {
          assert(response.body instanceof Array);
          assert(response.body.length >= 1);
          done();
        })
        .catch(err => done(err));
      });
      
    });

    describe('POST /teams/values', function() {

      before(function() {
        divider();
      });

      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .post('/teams/values')
        .expect(401, done);
      });

      it('responds 403 if session.userId does not have admin privileges', function(done) {
        userSession.post('/teams/values')
        .expect(403, done);
      });

      it('responds 400 if the user has admin privileges but there is no specified userId', function(done) {
        adminSession.post('/teams/values')
        .send({})
        .expect(400, done);
      });

      it('responds 400 if the user has admin privileges but the groupId is not valid', function(done) {
        adminSession.post('/teams/values')
        .send({teamId: "potato"})
        .expect(400, done);
      });

      it('responds 400 if the user has admin privileges but the groupId is not valid', function(done) {
        adminSession.post('/teams/values')
        .send({teamId: 0})
        .expect(400, done);
      });

      it('responds 200 if the user has admin privileges and the groupId is valid, returns a new group_assessment_id', function(done) {
        adminSession.post('/teams/values')
        .send({teamId: 1})
        .expect(200)
        .then(response => {
          const {aggregate_assessment_id} = response.body[0];
          expect(aggregate_assessment_id !== undefined);
          done();
        });
      });

    });

  });
  
  describe('Assignments Router', function() {

    before(function() {
      divider();
    });

    describe('POST /assignments', function() {

      before(function() {
        divider();
      });
      
      it('responds 401 if session.userId is undefined', function(done) {
        request(app)
        .post('/assignments')
        .expect(401, done);
      });

      it('responds 403 if session.userId does not have admin privileges', function(done) {
        userSession.post('/assignments')
        .expect(403, done);
      });

      it('responds 400 if session.userId is not undefined and user is an admin but no teamId is provided', function(done) {
        adminSession.post('/assignments')
        .send({userId: 2})
        .expect(400, done);
      });

      it('responds 400 if session.userId is not undefined and user is an admin but userId is provided', function(done) {
        adminSession.post('/assignments')
        .send({teamId: 1})
        .expect(400, done);
      });
      
      it('responds 400 if session.userId is not undefined and user is an admin but the userId is not valid', function(done) {
        adminSession.post('/assignments')
        .send({userId: 99, teamId: 1})
        .expect(400, done);
      });

      it('responds 400 if session.userId is not undefined and user is an admin but the teamId is not valid', function(done) {
        adminSession.post('/assignments')
        .send({userId: 2, teamId: 99})
        .expect(400, done);
      });

      it('responds 200 if request is valid and returns the id', function(done) {
        adminSession.post('/assignments')
        .send({userId: 2, teamId: 1})
        .expect(200)
        .then(response => {
          const {id} = response.body;
          assert(id !== undefined);
          done();
        })
        .catch(err=>done(err));
      });

    });

  });

  //aggregate assessments must be run last due to setup in earlier tests
  describe('GET /assessments/', function() {
    before(function() {
      divider();
    });

    it('responds 401 if session.userId is undefined', function(done) {
      request(app)
      .get('/assessments/aggregate/1')
      .expect(401, done);
    });

    it('responds 403 if session.userId does not have admin privileges', function(done) {
      userSession.get('/assessments/aggregate/1')
      .expect(403, done);
    });
    
    it('responds 404 if assessment_id is invalid', function(done) {
      adminSession.get('/assessments/aggregate/potato')
      .expect(404, done);
    });

    it('responds 404 if assessment_id is valid but does not exist', function(done) {
      adminSession.get('/assessments/aggregate/99')
      .expect(404, done);
    });

    it('responds 404 if admin and aggregate assessment exists but no associated values_assessments have been completed', function(done) {
      adminSession.get('/assessments/aggregate/1')
      .expect(404, done);
    });

    it('responds 200 if admin and aggregate assessment exists but no associated values_assessments have been completed', function(done) {
      //insert new data into a values assessment that references an aggregate_assessment_id
      userSession.put('/assessments/values/4')
      .send({
        values: [
          { value: 'Ambition', is_custom: false },
          { value: 'Authority', is_custom: false },
          { value: 'Autonomy', is_custom: false },
          { value: 'Beauty', is_custom: false },
          { value: 'Belonging', is_custom: false },
          { value: 'Boldness', is_custom: false },
          { value: 'Buoyancy', is_custom: false },
          { value: 'Calm', is_custom: false },
          { value: 'Celebrity/Fame', is_custom: false },
          { value: 'Raditude', is_custom: true },
        ]
      })
      .expect(200)
      .then(response => {
        adminSession.get('/assessments/aggregate/1')
          .expect(200)
          .then(response => {
            const { body } = response;
            expect(body instanceof Object);
            done();
          })
        });
    });

  });

});