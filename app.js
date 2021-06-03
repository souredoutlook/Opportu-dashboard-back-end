require('dotenv').config();

const {
  KEY1,
  KEY2,
  MAILER_USER,
  MAILER_PASS,
} = process.env;

const db = require("./db/helpers/index");
const bcrypt = require('bcrypt');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAILER_USER,
    pass: MAILER_PASS
  }
});

const express = require('express');
const logger = require('morgan');
const cookieSession = require('cookie-session');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const sessionsRouter = require('./routes/sessions');
const assessmentsRouter = require('./routes/assessments');
const groupsRouter = require('./routes/groups');
const teamsRouter = require('./routes/teams');
const assignmentsRouter = require('./routes/assignments');

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
app.use('/users', usersRouter(db, bcrypt, transporter));
app.use('/sessions', sessionsRouter(db, bcrypt));
app.use('/assessments', assessmentsRouter(db, transporter));
app.use('/groups', groupsRouter(db));
app.use('/teams', teamsRouter(db));
app.use('/assignments', assignmentsRouter(db));

module.exports = app;
