var log = require('logger')('serandives:boot');
var nconf = require('nconf').argv().env();
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var sera = require('sera');
var server = require('./index');

var env = nconf.get('ENV');

nconf.defaults(require('./env/' + env + '.json'));

var mongourl = nconf.get('MONGODB_URI');
var ssl = !!nconf.get('MONGODB_SSL');

var initScripts = fs.readdirSync(path.join(__dirname, 'initializers', 'scripts'));

var serandivesScripts = function () {
  var scripts = [];
  initScripts.forEach(function (name) {
    scripts.push({
      name: name,
      initializer: require('./initializers/scripts/' + name)
    });
  });
  return scripts;
};

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
  server.prepare(function (err) {
    if (err) {
      return done(err);
    }
    sera.boot(serandivesScripts(), function (err) {
      mongoose.disconnect(function () {
        if (err) {
          return log.error('initializers:errored', err);
        }
        log.info('db:initialized');
      });
    });
  });
});