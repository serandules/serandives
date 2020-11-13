var log = require('logger')('initializers:serandives:workflows');
var util = require('util');

var sera = require('sera');
var utils = sera.utils;

var adminEmail = utils.adminEmail();

module.exports = function (done) {
  sera.model('users').findOne({email: adminEmail}, function (err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(util.format('No user with email %s can be found.', adminEmail));
    }
    workflowModelMessages(user, function (err) {
      if (err) {
        return done(err);
      }
      log.info('workflow:created');
      done();
    });
  });
};

var workflowModelMessages = function (user, done) {
  sera.model('workflows').create({
    name: 'model-messages',
    user: user,
    _: {},
    start: 'sent',
    transitions: {
      sent: {
        receive: 'received'
      },
      received: {
        unreceive: 'sent'
      }
    },
    permits: {
      sent: {
        groups: {
          admin: {
            actions: ['*'],
            visibility: ['*']
          }
        },
        model: {
          to: {
            user: {
              actions: ['read', 'receive', 'delete'],
              visibility: ['*']
            }
          }
        },
        user: {
          actions: ['read', 'update', 'delete'],
          visibility: ['*']
        }
      },
      received: {
        groups: {
          admin: {
            actions: ['*'],
            visibility: ['*']
          }
        },
        model: {
          to: {
            user: {
              actions: ['read', 'unreceive', 'delete'],
              visibility: ['*']
            }
          }
        },
        user: {
          actions: ['read'],
          visibility: ['*']
        }
      }
    },
    visibility: {},
    permissions: {}
  }, done);
};
