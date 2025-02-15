var nconf = require('nconf');
var async = require('async');
var fs = require('fs');
var path = require('path');
var dust = require('dustjs-linkedin');
var util = require('util');
var errors = require('errors');
var messenger = require('messenger');

var sera = require('sera');
var middlewares = sera.middlewares;
var validators = sera.validators;
var utils = sera.utils;
var services = sera.services;

var types = validators.types;

var sns = utils.sns();

var smsSender = nconf.get('SMS_SENDER');

var template = function (name) {
  var data = fs.readFileSync(path.join(__dirname, '..', 'templates', name + '.html'));
  dust.loadSource(dust.compile(String(data), 'service-contacts-' + name));
};

template('verify');

var verifyEmail = function (user, contact, done) {
  var email = contact.email;
  if (!contact.email) {
    return done();
  }
  if (contact._ && contact._.verified && contact._.verified.email) {
    return done();
  }
  types.email({
    field: 'email'
  })({value: email}, function (err) {
    if (err) {
      return done(err);
    }
    sera.model('otps').remove({
      user: user.id,
      name: 'contacts-verify',
      for: email
    }, function (err) {
      if (err) {
        return done(err);
      }
      services.create({
        user: user,
        model: sera.model('otps'),
        data: {
          name: 'contacts-verify',
          for: email
        },
        overrides: {}
      }, function (err, otp) {
        if (err) {
          return done(err);
        }
        var ctx = {
          user: user,
          email: email,
          title: 'Your contact email verification code',
          code: otp.weak
        };
        dust.render('service-contacts-verify', ctx, function (err, html) {
          if (err) {
            return done(err);
          }
          messenger.email({
            from: 'Serandives <no-reply@serandives.com>',
            to: email,
            subject: ctx.title,
            html: html,
            text: html
          }, done);
        });
      });
    });
  });
};

var verifyPhone = function (user, contact, done) {
  var phone = contact.phone;
  if (!contact.phone) {
    return done();
  }
  if (contact._ && contact._.verified && contact._.verified.phone) {
    return done();
  }
  types.phone({
    field: 'phone'
  })({value: phone}, function (err) {
    if (err) {
      return done(err);
    }
    sera.model('otps').remove({
      user: user.id,
      name: 'contacts-verify',
      for: phone
    }, function (err) {
      if (err) {
        return done(err);
      }
      services.create({
        user: user,
        model: sera.model('otps'),
        data: {
          name: 'contacts-verify',
          for: phone
        },
        overrides: {}
      }, function (err, otp) {
        if (err) {
          return done(err);
        }
        messenger.sms({
          phone: phone,
          sender: smsSender,
          message: util.format('%s is your %s verification code.', otp.weak, utils.domain())
        }, done);
      });
    });
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
      verifyEmail(req.user, contact, function (err) {
        if (err) {
          return next(err);
        }
        verifyPhone(req.user, contact, function (err) {
          if (err) {
            return next(err);
          }
          res.status(204).end();
        });
      });
    });
  });
};
