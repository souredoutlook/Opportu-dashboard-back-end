// test/index.js

const request = require('supertest');
const app = require('../bin/server');
const assert = require('assert');

describe('All routes', function() {
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

    it('fails without credentials', function(done) {
      request(app)
        .post('/sessions/new')
        .expect(400, done);
    });

  });


});