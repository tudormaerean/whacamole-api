var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var auth = require('http-auth');

var index = require('./routes/index');

var config = require('./config/config');
var utils = require('./utils/utils');

var moleGeneratorRoutes = require('./routes/mole-generator.route');

var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);

// configuration =================

app.use(bodyParser.json());  // parse application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/scripts'));
app.use(express.static(__dirname + '/style'));

// setup application for local development
if ('localhost' === config.getAppEnv().bind) {
  // extract configuration from manifest file to bind app to specific Bluemix
  config.extractManifest('jsc-tudormaerean-whacamole-api-dev', function (err, manifest) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    config.uploadEnvVariables(manifest.env, function (err, status) {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      // set app port for localhost
      process.env.PORT = 3002;
      // bypass self signed certificates for localhost
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    });
  });
}

app.set('port', process.env.PORT);

app.use('/', index);
app.use('/api/mole-generator', moleGeneratorRoutes);

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

io.on('connect', function (socket) {
  console.log('Connection from client established.');
  var moles = [];
  var game = new utils.game();

  socket.on('click', function (index) {
    console.log('Client clicked on mole: ' + index);
    socket.emit('echo', index);
    game.click(index, socket);
  });

  socket.on('init', function () {
    game.initialize(socket);
  });

  socket.on('close', function () {
    game.end();
    socket.disconnect();
    console.log('Server socket disconnected.');
  });
});

// listen (start app with node server.js) ======================================
server.listen(app.get('port'), '0.0.0.0', function () {
  console.log('Express server listening on port ' + app.get('port'));
  // init functions
  config.printActiveEnvInformation();
});

module.exports = app;