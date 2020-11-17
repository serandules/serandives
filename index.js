var log = require('logger')('serandives');
var nconf = require('nconf').use('memory').argv().env();
var _ = require('lodash');
var async = require('async');
var path = require('path');
var fs = require('fs');
var vhost = require('vhost');
var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var compression = require('compression');
var format = require('string-template');

var errors = require('errors');

var clients = require('./utils/clients');

var sera = require('sera');

var findClients = function () {
  var key;
  var value;
  var splits;
  var subdomain;
  var o = [];
  var type = 'client';
  var prefix = type.toUpperCase();
  var all = nconf.get();

  value = all[prefix];
  if (value) {
    splits = value.split(':');
    o.push({
      type: 'client',
      name: splits[0],
      version: splits[1],
      subdomain: '',
      prefix: '/'
    });
  }
  prefix += '_';
  for (key in all) {
    if (!all.hasOwnProperty(key)) {
      continue;
    }
    if (key.indexOf(prefix) !== 0) {
      continue;
    }
    subdomain = key.substring(prefix.length);
    subdomain = subdomain.toLowerCase().replace('_', '-');
    value = all[key];
    splits = value.split(':');

    o.push({
      type: 'client',
      name: splits[0],
      version: splits[1],
      subdomain: subdomain,
      prefix: '/'
    });
  }
  return o;
};

var redirects = function (apps) {
  var from = nconf.get('REDIRECTS');
  if (!from) {
    return;
  }
  from = from.split('|');
  from.forEach(function (host) {
    apps.use(vhost(host, function (req, res) {
      res.redirect(301, sera.resolve('www://'));
    }));
  });
};

var loadClients = function (apps, domain, subdomain, done) {
  var clientz = findClients();

  var subdomains = {};

  clientz.forEach(function (client) {
    var subdomain = subdomains[client.subdomain] || (subdomains[client.subdomain] = []);
    subdomain.push(client);
  });

  clients.init(function (err) {
    if (err) {
      return done(err);
    }

    async.eachSeries(Object.keys(subdomains), function (sub, subdomainDone) {
      var app = express();
      app.disable('x-powered-by');
      var clientz = subdomains[sub];
      async.eachSeries(clientz, function (client, clientDone) {
        var routes;
        try {
          routes = require('./domains/' + client.name);
        } catch (e) {
          return done(e);
        }

        routes(app, function (err) {
          if (err) {
            return clientDone(err);
          }
          log.info('modules:registered', 'subdomain:%s name:%s type:client', sub, client.name);
          clientDone();
        });
      }, function (err) {
        if (err) {
          return subdomainDone(err);
        }
        var prefix = sub ? format(subdomain, {subdomain: sub}) + '.' : '';
        var host = prefix + domain;
        apps.use(vhost(host, app));
        log.info('hosts:registered', 'name:%s', host);
        subdomainDone();
      });
    }, done);
  });
};

var serandives = function (done) {
  sera(function (err) {
    if (err) {
      return done(err);
    }
    sera.extend(require('./models'), function (err) {
      if (err) {
        return done(err);
      }
      boot(serandives, done);
    });
  });
};

module.exports = serandives;

var boot = function (serandives, done) {
  serandives.boot = function (done) {
    fs.readdir(path.join(__dirname, 'initializers', 'scripts'), function (err, extended) {
      if (err) {
        return done(err);
      }
      var scripts = [];
      extended.forEach(function (name) {
        scripts.push({
          name: name,
          initializer: require('./initializers/scripts/' + name)
        });
      });
      sera.boot(scripts, done)
    });
  };

  serandives.serve = function (done) {
    var version = 'v';
    var prefix = '/' + version;
    var apps = express();
    var services = express();

    sera.serve({prefix: prefix, server: services}, function (err) {
      if (err) {
        return done(err);
      }
      var utils = sera.utils;
      var middlewares = sera.middlewares;
      var domain = utils.domain();
      var subdomain = utils.subdomain();

      apps.disable('x-powered-by');
      apps.use(morgan(':remote-addr :method :url :status :res[content-length] - :response-time ms'));
      apps.use(middlewares.pond);
      apps.use(middlewares.throttleByAPI('tiers'));
      redirects(apps);
      apps.use(cors({
        exposedHeaders: ['Content-Type', 'Link']
      }));
      apps.use(compression());

      apps.get('/status', function (req, res) {
        res.json({
          status: 'healthy'
        });
      });

      if (nconf.get('SERVER_TRUST_PROXY')) {
        apps.enable('trust proxy');
      }

      if (nconf.get('SERVER_SSL')) {
        apps.use(middlewares.ssl);
      }

      var host = format(subdomain, {subdomain: 'apis'}) + '.' + domain;
      apps.use('/' + version, vhost(host, services));
      log.info('services:registered', 'host:%s, version:%s', host, version);

      loadClients(apps, domain, subdomain, function (err) {
        if (err) {
          return done(err);
        }
        apps.use(function (err, req, res, next) {
          if (err.status) {
            return res.pond(err);
          }
          log.error('server-error:errored', err);
          res.pond(errors.serverError());
        });

        apps.use(function (req, res, next) {
          res.pond(errors.notFound());
        });

        var port = nconf.get('PORT');
        var server = apps.listen(port, function (err) {
          if (err) {
            return done(err);
          }
          log.info('server:started', 'port:%s', port);
          done(null, server);
        });
      });
    });
  };

  done();
};
