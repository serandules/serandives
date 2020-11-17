var log = require('logger')('sarandives:server');
var nconf = require('nconf').use('memory').argv().env();
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var env = nconf.get('ENV');

nconf.defaults(require('./env/' + env + '.json'));

var mongourl = nconf.get('MONGODB_URI');

var ssl = !!nconf.get('MONGODB_SSL');

var serandives = require('./index');

var server;

mongoose.connect(mongourl, {
  authSource: 'admin',
  ssl: ssl
});

var db = mongoose.connection;

db.on('error', function (err) {
  log.error('db:errored', err);
});

db.once('open', function () {
  log.info('db:opened');
  start(function (err) {
    if (err) {
      log.error('server:start', err);
      return process.exit(1);
    }
  });
});

process.on('uncaughtException', function (err) {
  log.error('uncaught:threw', err);
  process.exit(1);
});

var start = function (done) {
  serandives(function (err) {
    if (err) {
      return done(err);
    }
    serandives.serve(function (err, serv) {
      if (err) {
        return done(err);
      }
      server = serv;
      done();
    });
  });
};