var log = require('logger')('initializers:serandives:makes');
var async = require('async');
var _ = require('lodash');

var sera = require('sera');
var commons = require('../commons');

var brands = require('../vehicles/brands');

var createModels = function (o, brand, models, done) {
  var workflow = o.workflows.model;
  async.eachLimit(models, 10, function (model, modeled) {
    var visibility = _.cloneDeep(o.visibility);
    visibility.brand = {
      groups: [o.public._id, o.anonymous._id]
    };
    visibility.title = {
      groups: [o.public._id, o.anonymous._id]
    };
    model.description = 'This is the model ' + brand.title + '.';
    model.user = o.adminUser;
    model.brand = brand;
    model.model = 'vehicles';
    model.permissions = o.permissions;
    model.visibility = visibility;
    model.workflow = workflow;
    model.status = 'published';
    model._ = {};
    sera.model('models').create(model, function (err, o) {
      if (err) {
        return modeled(err);
      }
      log.info('models:created', 'title:%s', o.title);
      modeled();
    });
  }, done);
};

module.exports = function (done) {
  commons.meta(function (err, o) {
    if (err) {
      return done(err);
    }
    async.eachLimit(brands, 10, function (brand, made) {
      sera.model('brands').findOne({title: brand.title, models: 'vehicles'}).exec(function (err, oo) {
        if (err) {
          return made(err);
        }
        if (oo) {
          return createModels(o, oo, brand.models, made);
        }
        var visibility = _.cloneDeep(o.visibility);
        visibility['*'] = {
          groups: [o.public._id, o.anonymous._id]
        };
        sera.model('brands').create({
          title: brand.title,
          description: 'This is the brand ' + brand.title + '.',
          user: o.adminUser,
          models: ['vehicles'],
          permissions: o.permissions,
          visibility: visibility,
          workflow: o.workflows.model,
          status: 'published',
          _: {}
        }, function (err, oo) {
          if (err) {
            return made(err);
          }
          log.info('brands:created', 'title:%s', oo.title);
          createModels(o, oo, brand.models, made);
        });
      });
    }, done);
  });
};
