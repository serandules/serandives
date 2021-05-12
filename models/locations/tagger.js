var util = require('util');
var sera = require('sera');
var errors = require('errors');

var format = function () {
  return util.format.apply(util.format, Array.prototype.slice.call(arguments));
};

var unprocessableEntity = function () {
  var message = format.apply(format, Array.prototype.slice.call(arguments));
  return errors.unprocessableEntity(message);
};

exports.validator = function (o, tags, done) {
  var tag;
  var allowed = ['postal', 'city', 'district', 'province', 'state', 'country'];
  for (var i = 0; i < tags.length; i++) {
    tag = tags[i];
    if (allowed.indexOf(tag.name) === -1) {
      return done(unprocessableEntity('\'%s\' contains an invalid value', o.field))
    }
  }

  done();
};

exports.value = function (o, field, location, done) {
  sera.model('locations').findOne({_id: location}, function (err, location) {
    if (err) {
      return done(err);
    }
    var tags = [];
    if (!location) {
      return done(null, tags);
    }
    if (location.postal) {
      tags.push({name: 'postal', value: location.postal, group: field});
    }
    if (location.city) {
      tags.push({name: 'city', value: location.city, group: field});
    }
    if (location.district) {
      tags.push({name: 'district', value: location.district, group: field});
    }
    if (location.province) {
      tags.push({name: 'province', value: location.province, group: field});
    }
    if (location.state) {
      tags.push({name: 'state', value: location.state, group: field});
    }
    if (location.country) {
      tags.push({name: 'country', value: location.country, group: field});
    }
    done(null, tags);
  });
};