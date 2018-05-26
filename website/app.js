var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var session = require('express-session');

// SQL stuff
var mysql = require('mysql');
var dbConnectionPool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password ',
  database: 'hotels'
});


var app = express();

// Moar SQL stuff
app.use(function(
  req, res, next) {
  req.pool =
    dbConnectionPool;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

app.use(session({
  secret: "a string of your choice",
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // respond with html page
  if (req.accepts('html')) {
    res.sendFile('public/404.html', {
      root: __dirname
    });
    return;
  }

  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

//meow