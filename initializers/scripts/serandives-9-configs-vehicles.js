var log = require('logger')('initializers:serandives:configs-vehicles');
var _ = require('lodash');

var sera = require('sera');
var modelUtils = require('model-utils');
var brandUtils = modelUtils.brands;
var commons = require('../commons');

module.exports = function (done) {
  commons.meta(function (err, o) {
    if (err) {
      return done(err);
    }
    brandUtils.find('vehicles', function (err, brands) {
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
        name: 'brands-vehicles',
        value: JSON.stringify(brands),
        workflow: o.workflows.model,
        status: 'published',
        permissions: o.permissions,
        visibility: visibility,
        _: {}
      }, function (err) {
        if (err) {
          return done(err);
        }
        log.info('brands-vehicles:created');
        done();
      });
    });
  });
};
