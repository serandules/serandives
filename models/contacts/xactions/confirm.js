var async = require('async');
var util = require('util');
var errors = require('errors');

var sera = require('sera');
var middlewares = sera.middlewares;
var services = sera.services;

var confirmEmail = function (user, contact, data, done) {
  if (!data.email) {
    return done();
  }
  var email = contact.email;
  if (!email) {
    return done(errors.unprocessableEntity('\'email\' cannot be found in the contact'));
  }
  if (contact._ && contact._.verified && contact._.verified.email) {
    return done(errors.unprocessableEntity('\'email\' has already been verified'));
  }
  sera.model('otps').findOneAndDelete({
    user: user,
    name: 'contacts-verify',
    for: email
  }, function (err, otp) {
    if (err) {
      return done(err);
    }
    if (!otp) {
      return done(errors.forbidden());
    }
    sera.model('contacts').update({_id: contact.id}, {
      '_.verified.email': true
    }, done);
  });
};

var confirmPhone = function (user, contact, data, done) {
  if (!data.phone) {
    return done();
  }
  var phone = contact.phone;
  if (!phone) {
    return done(errors.unprocessableEntity('\'phone\' cannot be found in the contact'));
  }
  if (contact._ && contact._.verified && contact._.verified.phone) {
    return done(errors.unprocessableEntity('\'phone\' has already been verified'));
  }
  sera.model('otps').findOneAndDelete({
    user: user,
    name: 'contacts-verify',
    for: phone
  }, function (err, otp) {
    if (err) {
      return done(err);
    }
    if (!otp) {
      return done(errors.forbidden());
    }
    sera.model('contacts').update({_id: contact.id}, {
      '_.verified.phone': true
    }, done);
  });
};

module.exports = function (route) {
  route.use(middlewares.json);
  route.use(middlewares.findOne(sera.model('contacts')));

  route.use(function (req, res, next) {
    services.findOne(req.ctx, function (err, contact) {
      if (err) {
        return next(err);
      }
      if (!contact) {
        return next(errors.notFound());
      }
      confirmEmail(req.user, contact, req.body, function (err) {
        if (err) {
          return next(err);
        }
        confirmPhone(req.user, contact, req.body, function (err) {
          if (err) {
            return next(err);
          }
          res.status(204).end();
        });
      });
    });
  });
};
