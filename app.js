var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let jwt = require('jsonwebtoken');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var blogRouter = require('./routes/blogServer');
var loginRouter = require('./routes/login');
var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/blog', blogRouter);
app.use('/login', loginRouter);
app.use('/api', apiRouter);
app.get('/list', (req, res)=>{
  res.redirect('/editor/');
})

/* Request Handling Chain

Multiple handlers may be attached at the same path

When multiple handlers match a request, they are processed top down in the sequence they are attached
Request handling chain
Inside a handler, calling the third parameter next() exits from the current handler and moves on to the next in the chain

If next() is not called, the request processing stops there, ignoring the rest in the chain  */

app.get('/editor', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token == null) {
    res.redirect('/login?redirect=/editor/');
  } else {
    var decoded = jwt.verify(token, 'C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c')
    if (decoded.exp * 1000 <= Date.now()) {
      res.redirect('/login?redirect=/editor/');
    }else{
      next();
    }
  }
});

app.use(express.static(path.join(__dirname, 'public'))); // use the file in the public as a link address.

// catch 404 and forward to error handler
app.use(function(req, res, next) {
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
