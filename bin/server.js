// bin/server.js

require('dotenv').config();

const {
  PORT,
} = process.env;

const app = require('../app')

const httpServer = require('http').createServer(app);

httpServer.listen(PORT);

module.exports = httpServer;