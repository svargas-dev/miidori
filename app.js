'use strict';

const { join } = require('path');
const express = require('express');
const hbs = require('hbs');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo(expressSession);
const mongoose = require('mongoose');
const User = require('./models/user');
const profileRouter = require('./routes/profile');
const postRouter = require('./routes/post');
// const showTeachersRouter = require('./routes/showTeacher');

//HBS HELPERS
const indexRouter = require('./routes/index');
const authenticationRouter = require('./routes/authentication');

const app = express();
hbs.registerPartials(join(__dirname, 'views/partials'));
hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('ifNotEquals', function(arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('select', function(value, options) {
  return options
    .fn(this)
    .split('\n')
    .map(v => {
      const t = 'value="' + value + '"';
      return !RegExp(t).test(v) ? v : v.replace(t, t + ' selected="selected"');
    })
    .join('\n');
});

app.set('view engine', 'hbs');
app.set('views', join(__dirname, 'views'));

app.use(serveFavicon(join(__dirname, 'public/images', 'favicon.ico')));
app.use(
  sassMiddleware({
    src: join(__dirname, 'public'),
    dest: join(__dirname, 'public'),
    outputStyle:
      process.env.NODE_ENV === 'development' ? 'nested' : 'compressed',
    sourceMap: true,
    force: process.env.NODE_ENV === 'development'
  })
);
app.use(express.static(join(__dirname, 'public')));

app.use(logger('dev'));
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(cookieParser());

app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 24 * 15,
      sameSite: 'lax',
      httpOnly: true
      // secure: process.env.NODE_ENV !== 'development'
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 60 * 60 * 24
    })
  })
);

app.use((req, res, next) => {
  const userId = req.session.user;
  if (userId) {
    User.findById(userId)
      .then(user => {
        req.user = user;
        res.locals.user = req.user;
        next();
      })
      .catch(error => {
        next(error);
      });
  } else {
    next();
  }
});

app.use('/', indexRouter);
// app.use('/showTeacher', showTeachersRouter);
app.use('/authentication', authenticationRouter);
app.use('/profile', profileRouter);
// app.use('/user', usersRouter);
app.use('/post', postRouter);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  console.log(error);
  // Set error information, with stack only available in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  res.status(error.status || 500);
  res.render('error');
});

module.exports = app;
