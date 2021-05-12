var log = require('logger')('initializers:serandives:configs-aliases');

var _ = require('lodash');
var sera = require('sera');
var commons = require('../commons');

module.exports = function (done) {
  commons.meta(function (err, o) {
    if (err) {
      return done(err);
    }
    var visibility = _.cloneDeep(o.visibility);
    visibility.name = {
      groups: [o.public._id, o.anonymous._id]
    };
    visibility.value = {
      groups: [o.public._id, o.anonymous._id]
    };
    sera.model('configs').create({
      user: o.adminUser,
      name: 'aliases',
      value: JSON.stringify({}),
      workflow: o.workflows.model,
      status: 'published',
      permissions: o.permissions,
      visibility: visibility,
      _: {}
    }, function (err) {
      if (err) {
        return done(err);
      }
      log.info('aliases:created');
      done();
    });
  });
};
