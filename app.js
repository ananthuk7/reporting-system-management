var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var moment = require('moment');
var bodyParser = require('body-parser');


var connection = require('express-myconnection');
var mysql = require('mysql');

// var con = require('./config')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var coursesRouter = require('./routes/courses');
var studentsRouter = require('./routes/student');
var enrollsRouter = require('./routes/enrolls');



var app = express();

app.use(
  connection(mysql, {

    host: 'localhost',
    user: 'root',
    password: 'password',
    port: 3306, //port mysql
    database: 'enrollment'

  }, 'pool') //or single


);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({ secret: 'ssshhhhh', resave: false, saveUninitialized: true, }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/courses', coursesRouter);
app.use('/students', studentsRouter);
app.use('/enrolls', enrollsRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
