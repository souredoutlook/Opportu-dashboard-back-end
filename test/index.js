//index.js

const request = require('supertest');
const app = require('../bin/server')

describe('GET /', function() {
  after((done) => {
    app.close(done);
  })

  it('responds with text', function(done) {
    request(app)
      .get('/')
      .expect(200, "Hello world", done)
  });
});