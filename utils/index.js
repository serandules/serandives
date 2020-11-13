var log = require('logger')('utils');
var nconf = require('nconf');
var async = require('async');
var request = require('request');
var _ = require('lodash');

var sera = require('sera');
var utils = sera.utils;

var cdn = nconf.get('CDN_STATICS');

var env = nconf.get('ENV');

exports.env = function () {
  return env;
};

exports.index = function (id, revision, done) {
  var url = cdn + '/' + id + '/' + revision + '/' + id + '/index.html';
  log.info('index:url', 'id:%s, url:%s', id, url);
  request(url, function (err, res, body) {
    done(err, body);
  });
};

exports.boots = function (names, done) {
  names.values = ['boot', 'users', 'groups', 'menus', 'aliases'].concat(names.values || []);
  names.ids = ['vehicle-makes'].concat(names.ids || []);
  exports.configs(names, function (err, o) {
    if (err) {
      return done(err);
    }
    var menus = o.values.menus;
    exports.configs({values: Object.keys(menus)}, function (err, menus) {
      if (err) {
        return done(err);
      }
      _.assign(o.values, menus.values);
      done(null, o);
    });
  });
};

exports.configs = function (o, done) {
  var allValues = {};
  var allIds = {};
  var values = o.values || [];
  var ids = o.ids || [];
  var valuesById = _.keyBy(values);
  var names = values.concat(ids);

  var index = function (name, o) {
    if (valuesById[name]) {
      allValues[name] = o.value;
      return;
    }
    allIds[name] = o.id;
  };

  async.each(names, function (name, eachDone) {
    utils.cached('configs:' + name, function (err, o) {
      if (err) return eachDone(err);
      if (o) {
        index(name, JSON.parse(o));
        return eachDone();
      }
      sera.model('configs').findOne({
        name: name
      }, function (err, config) {
        if (err) {
          return eachDone(err);
        }
        config = utils.json(config);
        utils.group('public', function (err, pub) {
          if (err) {
            return eachDone(err);
          }
          utils.group('anonymous', function (err, anon) {
            if (err) {
              return eachDone(err);
            }
            var permitted = utils.permitted({groups: [pub.id, anon.id]}, config, 'read');
            if (!permitted) {
              return eachDone();
            }
            index(name, config);
            eachDone();
          });
        });
      });
    });
  }, function (err) {
    if (err) {
      return done(err);
    }
    done(null, {ids: allIds, values: allValues});
  });
};

exports.supportEmail = function () {
  return 'support@' + utils.emailDomain();
};

exports.talkEmail = function () {
  return 'talk@' + utils.emailDomain();
};

/*exports.bumpable = function (ctx, done) {
  if (ctx.found) {
    return done();
  }
  var action = ctx.action;
  ctx.action = 'bumpup';
  exports.findOne(ctx, function (err) {
    if (err) {
      ctx.action = action;
      return done(err);
    }
    var user = ctx.user;
    if (!user) {
      ctx.action = action;
      return done(errors.unauthorized());
    }
    ctx.model.findOne(ctx.query, function (err, found) {
      ctx.action = action;
      if (err) {
        return done(err);
      }
      if (!found) {
        return done(errors.notFound());
      }
      ctx.found = utils.json(found);
      done();
    });
  });
};*/


