var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var decoder = require('polish-vehicle-registration-certificate-decoder');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
var fs = require('fs');
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'express-anti-bot.log'), { flags: 'a' });
app.use(morgan('[:date[clf]] :remote-addr :remote-user :method :url :status - :response-time ms', { stream: accessLogStream }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ type: 'application/json' }));
app.post('/api/car/aztec', (req, res) => {

  var aztec = new decoder.PolishVehicleRegistrationCertificateDecoder(req.body.aztec).data;

  if(aztec instanceof decoder.PolishVehicleRegistrationCertificateNewFormatData) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({aztec, error: null}));
  } else if (aztec instanceof decoder.PolishVehicleRegistrationCertificateOldFormatData) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({aztec, error: null}));
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  if(req.header('content-type') !== 'application/json') {
    res.send({'error': 500, 'message': 'Ustaw Nagłówek Content-Type na application/json', 'type': 'invalid_content_type'});
  } else if(err.message === 'Index out of range') {
    res.send({'error': 'Nieprawidłowy kod Aztec2D', 'message': 'Wprowadź poprawny kod Aztec2D', 'type': 'invalid_aztec2d', 'http': 500});
  } else if(res.locals.message) {
    // res.json(res.locals.message);
    console.log(res.locals.message);
    res.status(500);
    res.send({'error': 'Nieprawidłowy kod Aztec2D', 'message': 'Wprowadź poprawny kod Aztec2D', 'type': 'invalid_aztec2d', 'http': 500});
  } else {
    res.send({'error': 'Internal Server Error 500', 'message': 'Internal Server Error 500', 'type': 'internal_server_error', 'http': 500});
  }

  // console.log(res.locals.message);

});

module.exports = app;
