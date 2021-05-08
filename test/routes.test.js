// test/index.js

const request = require('supertest');
const session = require('supertest-session');
const app = require('../bin/server');
const assert = require('assert');

const testSession = session(app);

describe('All routes', function() {
  
  let authenticatedSession;

  //setup authenticated session 
  before(function(done) {
    testSession.post('/sessions/new')
      .send({"email": "nicholas@meisen.haus", "password": "password"})
      .expect(200)
      .end(function (err) {
        if (err) return done(err);
        authenticatedSession = testSession;
        return done();
      });
  });

  after((done) => {
    app.close(done);
  });

  describe('GET /', function() {
    
    it('responds with "Hello world"', function(done) {
      request(app)
        .get('/')
        .expect(200, "Hello world", done)
    });

  });


  describe('GET /users/', function() {

    it('responds with an array with a length of 1 or greater', function(done) {
      request(app)
        .get('/users/')
        .expect(200)
        .then(response => {
          assert(response.body instanceof Array);
          assert(response.body.length >= 1);
          done();
        })
        .catch(err => done(err));
    });

  });

  describe('GET /sessions/new', function() {

    it('responds 400 when request is without credentials', function(done) {
      request(app)
        .post('/sessions/new')
        .expect(400, done);
    });

    it('responds 401 if credentials if email is invalid', function(done) {
      request(app)
        .post('/sessions/new')
        .send({"email": "not@valid.email", "password": "potato"})
        .expect(401, done);
    });

    it('responds 401 if password is invalid', function(done) {
      request(app)
        .post('/sessions/new')
        .send({"email": "nicholas@meisen.haus", "password": "potato"})
        .expect(401, done);
    });

    it('responds 200 if credentials are valid', function(done) {
      request(app)
        .post('/sessions/new')
        .send({"email": "nicholas@meisen.haus", "password": "password"})
        .expect(200, done);
    });

  });

  describe('DELETE /session', function() {

    it('responds 401 if session is null', function(done) {
      testSession.delete('/session')
        .expect(401, done);
    });

  });


});