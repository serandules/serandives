var log = require('logger')('www');
var nconf = require('nconf');
var bodyParser = require('body-parser');
var dust = require('dustjs-linkedin');
var _ = require('lodash');

var errors = require('errors');
var sera = require('sera');
var utils = sera.utils;
var middlewares = sera.middlewares;
var serandUtils = require('../utils');

var domain = 'www';
var version = nconf.get('INDEX_' + domain.toUpperCase());
var server = utils.serverUrl();
var cdn = nconf.get('CDN_STATICS');
var googleKey = nconf.get('GOOGLE_KEY');
var adsense = nconf.get('GOOGLE_ADSENSE');

var boots = function (req, res, next) {
  serandUtils.boots({}, function (err, configs) {
    if (err) {
      return next(err);
    }
    req.configs = configs;
    next();
  });
};

module.exports = function (router, done) {

  router.use(bodyParser.urlencoded({extended: true}));

  serandUtils.index(domain, version, function (err, index) {
    if (err) {
      return done(err);
    }
    dust.loadSource(dust.compile(index, domain));
    //index page with embedded oauth tokens
    router.all('/auth', boots, function (req, res) {
      var context = {
        cdn: cdn,
        version: version,
        adsense: adsense,
        googleKey: googleKey,
        server: server,
        configs: req.configs,
        tid: req.body.tid,
        username: req.body.username,
        access: req.body.access_token,
        expires: req.body.expires_in,
        refresh: req.body.refresh_token
      };
      dust.render(domain, context, function (err, index) {
        if (err) {
          log.error('dust:render', err);
          return res.pond(errors.serverError());
        }
        res.set('Content-Type', 'text/html').status(200).send(index);
      });
    });

    router.use('/apis/*', middlewares.notFound);

    //index page
    router.all('*', boots, function (req, res) {
      var context = {
        cdn: cdn,
        version: version,
        adsense: adsense,
        googleKey: googleKey,
        server: server,
        configs: req.configs
      };
      dust.render(domain, context, function (err, index) {
        if (err) {
          log.error('dust:render', err);
          return res.pond(errors.serverError());
        }
        res.set('Content-Type', 'text/html').status(200).send(index);
      });
    });

    done();
  });
};
