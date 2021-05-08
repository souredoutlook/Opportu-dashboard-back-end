const db = require("./db/helpers/index");

const express = require('express');
const logger = require('morgan');
const bcrypt = require('bcrypt');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const sessionsRouter = require('./routes/sessions');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter());
app.use('/users', usersRouter(db));
app.use('/sessions', sessionsRouter(db, bcrypt));

module.exports = app;
