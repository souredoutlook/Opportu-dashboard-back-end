const db = require("./db/helpers/index");
const bcrypt = require('bcrypt');

require('dotenv').config();

const {
  KEY1,
  KEY2,
} = process.env;


const express = require('express');
const logger = require('morgan');
const cookieSession = require('cookie-session');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const sessionsRouter = require('./routes/sessions');

const app = express();

app.use(cookieSession({
  name: 'session',
  keys: [KEY1, KEY2],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter());
app.use('/users', usersRouter(db, bcrypt));
app.use('/sessions', sessionsRouter(db, bcrypt));

module.exports = app;
