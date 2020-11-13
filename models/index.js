var fs = require('fs');
var errors = require('errors');

var sera = require('sera');
var services = sera.services;
var utils = sera.utils;

var files = fs.readdirSync(__dirname);

var ignored = ['index.js'];

var BUMP_UP_THRESHOLD = 14 * 24 * 60 * 60 * 1000;

var bumpable = function (o) {
  return Date.now() - new Date(o.updatedAt) >= BUMP_UP_THRESHOLD;
};

var bumper = function (ctx, done) {
  ctx.action = 'bumpup';
  services.findOne(ctx, function (err, found) {
    if (err) {
      return done(err);
    }
    if (!found) {
      return done(errors.notFound());
    }
    ctx.found = utils.json(found);
    done();
  });
};

var bumpup = function (route) {
  route.use(function (req, res, next) {
    if (!req.user) {
      return next(errors.unauthorized());
    }
    req.ctx.user = req.user;
    next();
  });

  route.use(function (req, res, next) {
    var ctx = req.ctx;
    ctx.id = req.params.id;
    bumper(ctx, next);
  });

  route.use(function (req, res, next) {
    var ctx = req.ctx;
    if (!ctx.found) {
      return next(errors.notFound());
    }
    if (!bumpable(ctx.found)) {
      return next(errors.forbidden());
    }
    ctx.data = {
      updatedAt: new Date()
    };
    next();
  });

  route.use(function (req, res, next) {
    services.update(req.ctx, function (err, o) {
      if (err) {
        return next(err);
      }
      res.locate(o.id).status(200).send(o);
    });
  });
};

files.forEach(function (name) {
  if (ignored.indexOf(name) !== -1) {
    return;
  }

  var model = require('./' + name);
  var service = model.service;

  model.service = function (done) {
    service(function (err, o) {
      if (err) {
        return done(err);
      }

      if (!o.bumpable) {
        return done(null, o);
      }

      var xactions = o.xactions || (o.xactions = {});
      var post = xactions.post || (xactions.post = {});
      post.bumpup = bumpup;

      done(null, o);
    });
  };

  module.exports[name] = model;
});
