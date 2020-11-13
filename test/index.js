var fs = require('fs');
var path = require('path');

var sera = require('sera');
var pot = require('pot');

var server = require('../index');

var initScripts = fs.readdirSync(path.join(__dirname, '..', 'initializers', 'scripts'));

var serandivesScripts = function () {
  var scripts = [];
  initScripts.forEach(function (name) {
    scripts.push({
      name: name,
      initializer: require('../initializers/scripts/' + name)
    });
  });
  return scripts;
};

before(function (done) {
  console.log('starting up the server');
  pot.start(function (err) {
    if (err) {
      return done(err);
    }
    server.prepare(function (err) {
      if (err) {
        return done(err);
      }
      sera.boot(serandivesScripts(), function (err) {
        if (err) {
          return done(err);
        }
        server.start(done);
      });
    });
  });
});

after(function (done) {
  console.log('shutting down the server');
  pot.stop(function (destroyed) {
    server.stop(destroyed);
  }, done);
});