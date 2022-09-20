var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var db = require('./config/connection');
var session = require('express-session');
var bodyParser = require('body-parser');

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir: __dirname+'/views/partials/'}));
//creating a custom helper for hbs
var hbs=hbs.create({});
hbs.handlebars.registerHelper('if_eq', function(a, b, opts) {
  if(a == b) // Or === depending on your needs
      return opts.fn(this);
  else
      return opts.inverse(this);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(paypal());
app.use(session({secret:'Key',
saveUninitialized:true,
rolling:true,
cookie:{maxAge:6000000}}));

db.connect((err) => {
  if(err) console.log('Database connection error'+err);
  else console.log('Database connected succesfully');
})
app.use('/', userRouter);
app.use('/admin', adminRouter);

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
