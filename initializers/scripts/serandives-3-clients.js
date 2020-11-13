var log = require('logger')('initializers:serandives:clients');
var util = require('util');

var sera = require('sera');
var utils = sera.utils;

var email = utils.adminEmail();

var domain = utils.domain();

var to = [
  utils.resolve('accounts://'),
  utils.resolve(':///auth'),
  utils.resolve('www:///auth'),
  utils.resolve('accounts:///auth'),
  utils.resolve('admin:///auth'),
  utils.resolve('autos:///auth'),
  utils.resolve('realestates:///auth')
];

module.exports = function (done) {
  sera.model('users').findOne({email: email}, function (err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(util.format('No user with email %s can be found.', email));
    }
    sera.model('clients').update({
      name: domain,
      user: user,
      to: to
    }, function (err, client) {
      if (err) {
        return done(err);
      }
      log.info('clients:created');
      done();
    });
  });
};
