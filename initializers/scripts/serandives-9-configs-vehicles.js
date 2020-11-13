var log = require('logger')('initializers:serandives:configs-vehicles');
var _ = require('lodash');

var sera = require('sera');
var vehicleUtils = require('vehicle-utils');
var commons = require('../commons');

module.exports = function (done) {
  commons.meta(function (err, o) {
    if (err) {
      return done(err);
    }
    vehicleUtils.allMakes(function (err, makes) {
      if (err) {
        return done(err);
      }
      var visibility = o.visibility;
      visibility.name = {
        groups: [o.public._id, o.anonymous._id]
      };
      visibility.value = {
        groups: [o.public._id, o.anonymous._id]
      };
      sera.model('configs').create({
        user: o.adminUser,
        name: 'vehicle-makes',
        value: JSON.stringify(makes),
        workflow: o.workflows.model,
        status: 'published',
        permissions: o.permissions,
        visibility: visibility,
        _: {}
      }, function (err) {
        if (err) {
          return done(err);
        }
        log.info('vehicle-makes:created');
        done();
      });
    });
  });
};
