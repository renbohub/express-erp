var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const bodyParser = require('body-parser');

var SalesRouter = require('./routes/sales');
var SetupRouter = require('./routes/setup');
var AccountingRouter = require('./routes/accounting');
var PurchaseRouter = require('./routes/purchase');
var ProjectRouter = require('./routes/project');
var WarehouseRouter = require('./routes/warehouse');
var AuthRouter = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({
  limit: '50mb', extended: true,parameterLimit: 50000
}));
app.use(bodyParser.json({
  limit: "50mb",
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/renbo/api/v1.0/login', AuthRouter);
app.use('/renbo/api/v1.0/setup', SetupRouter);
app.use('/renbo/api/v1.0/sales', SalesRouter);
app.use('/renbo/api/v1.0/warehouse', WarehouseRouter);
app.use('/renbo/api/v1.0/accounting', AccountingRouter);
app.use('/renbo/api/v1.0/project', ProjectRouter);
app.use('/renbo/api/v1.0/purchase', PurchaseRouter);


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token"
  );
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
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
