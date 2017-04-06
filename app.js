var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Promise = require('promise');
var mongoose = require('mongoose');
var hbs = require('hbs');
var schedule = require('node-schedule');

var config = require('./config/config');
var crawler = require('./crawler/crawler');

var index = require('./routes/index');
var articles = require('./routes/articles');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// register helpers
require('./hbshepler/hbshelpers')(hbs);
require('amui-hbs-helper')(hbs);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/articles', articles);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

// database connection
mongoose.Promise = Promise;
mongoose.connect(config.database);

// schedule task
var rule = new schedule.RecurrenceRule();
rule.minute = config.scheduleRule;
var j = schedule.scheduleJob(rule, function () {
    crawler({
        pageLimit: config.defaultPageSearch,
        requestTimeout: config.requestTimeout
    });
});

module.exports = app;
