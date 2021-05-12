
var util = require('util');
var errors = require('errors');

var sera = require('sera');
var validators = sera.validators;
var types = validators.types;

var models = [
  'binaries',
  'brands',
  'clients',
  'configs',
  'contacts',
  'grants',
  'groups',
  'otps',
  'locations',
  'menus',
  'messages',
  'models',
  'pages',
  'realestates',
  'taxonomies',
  'tiers',
  'tokens',
  'users',
  'vehicles',
  'workflows'
];

var format = function () {
  return util.format.apply(util.format, Array.prototype.slice.call(arguments));
};

var unprocessableEntity = function () {
  var message = format.apply(format, Array.prototype.slice.call(arguments));
  return errors.unprocessableEntity(message);
};

exports.brand = function (options) {
  options = options || {};
  return function (o, done) {
    var value = o.value;
    var field = options.field || o.field;
    if (!value) {
      return done(unprocessableEntity('\'%s\' needs to be specified', field))
    }
    types.ref()(o, function (err, value) {
      if (err) {
        return done(err);
      }
      if (o.query) {
        return done(null, value);
      }
      sera.model('brands').findOne({_id: value}, function (err, brand) {
        if (err) {
          return done(err);
        }
        if (!brand) {
          return done(unprocessableEntity('\'%s\' contains an invalid value', field));
        }
        var data = o.data;
        var model = data.model;
        if (brand.models.indexOf(model) === -1) {
          return done(unprocessableEntity('\'%s\' contains an invalid value', field));
        }
        done(null, value);
      });
    });
  };
};

exports.model = function (options) {
  options = options || {};
  return function (o, done) {
    var value = o.value;
    var field = options.field || o.field;
    if (!value) {
      return done(unprocessableEntity('\'%s\' needs to be specified', field))
    }
    if (models.indexOf(value) === -1) {
      return done(unprocessableEntity('\'%s\' contains an invalid value', field));
    }
    done(null, value);
  };
};

exports.models = function (options) {
  options = options || {};
  return function (o, done) {
    var value = o.value;
    var field = options.field || o.field;
    if (!value) {
      return done(unprocessableEntity('\'%s\' needs to be specified', field))
    }
    if (!Array.isArray(value)) {
      return done(unprocessableEntity('\'%s\' contains an invalid value', field));
    }
    var i;
    var length = value.length;
    for (i = 0; i < length; i++) {
      if (models.indexOf(value[i]) === -1) {
        return done(unprocessableEntity('\'%s\' contains an invalid value', field));
      }
    }
    done(null, value);
  };
};