var log = require('logger')('serandives:boot');
var nconf = require('nconf').argv().env();
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var env = nconf.get('ENV');

nconf.defaults(require('./env/' + env + '.json'));

var serandives = require('./index');

var mongourl = nconf.get('MONGODB_URI');
var ssl = !!nconf.get('MONGODB_SSL');

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
  serandives(function (err) {
    if (err) {
      return log.error('initialize:serandives', err);
    }
    serandives.boot(function (err) {
      if (err) {
        return log.error('initialize:boot', err);
      }
      mongoose.disconnect(function () {
        if (err) {
          return log.error('initialize:database', err);
        }
        log.info('db:initialized');
      });
    });
  });
});