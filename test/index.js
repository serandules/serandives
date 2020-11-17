var pot = require('pot');

var serandives = require('../index');

var server;

before(function (done) {
  console.log('starting up the server');
  pot.start(function (err) {
    if (err) {
      return done(err);
    }
    serandives(function (err) {
      if (err) {
        return done(err);
      }
      serandives.boot(function (err) {
        if (err) {
          return done(err);
        }
        serandives.serve(function (err, serv) {
          if (err) {
            return done(err);
          }
          server = serv;
          done();
        })
      });
    });
  });
});

after(function (done) {
  console.log('shutting down the server');
  pot.stop(function (destroyed) {
    server.close(destroyed);
  }, done);
});