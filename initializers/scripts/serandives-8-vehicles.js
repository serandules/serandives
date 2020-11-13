var log = require('logger')('initializers:serandives:makes');
var async = require('async');

var sera = require('sera');
var commons = require('../commons');

var makes = require('../vehicles/makes');

var createModels = function (o, make, models, done) {
  var workflow = o.workflows.model;
  async.eachLimit(models, 10, function (model, modeled) {
    var visibility = o.visibility;
    visibility.make = {
      groups: [o.public._id, o.anonymous._id]
    };
    visibility.title = {
      groups: [o.public._id, o.anonymous._id]
    };
    model.user = o.adminUser;
    model.make = make;
    model.permissions = o.permissions;
    model.visibility = visibility;
    model.workflow = workflow;
    model.status = 'published';
    model._ = {};
    sera.model('vehicle-models').create(model, function (err, o) {
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
    async.eachLimit(makes, 10, function (make, made) {
      sera.model('vehicle-makes').findOne({title: make.title}).exec(function (err, oo) {
        if (err) {
          return made(err);
        }
        if (oo) {
          return createModels(o, oo, make.models, made);
        }
        var visibility = o.visibility;
        visibility.title = {
          groups: [o.public._id, o.anonymous._id]
        };
        make.user = o.adminUser;
        make.permissions = o.permissions;
        make.visibility = visibility;
        make.workflow = o.workflows.model;
        make.status = 'published';
        make._ = {};
        sera.model('vehicle-makes').create(make, function (err, oo) {
          if (err) {
            return made(err);
          }
          log.info('makes:created', 'title:%s', oo.title);
          createModels(o, oo, make.models, made);
        });
      });
    }, done);
  });
};
