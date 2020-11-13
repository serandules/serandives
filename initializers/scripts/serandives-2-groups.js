var log = require('logger')('initializers:serandives:groups');

var sera = require('sera');
var utils = sera.utils;
var serandUtils = require('../../utils');

var adminEmail = utils.adminEmail();
var supportEmail = serandUtils.supportEmail();
var talkEmail = serandUtils.talkEmail();

module.exports = function (done) {
  sera.model('users').findOne({email: adminEmail}, function (err, adminUser) {
    if (err) {
      return done(err);
    }
    sera.model('users').findOne({email: supportEmail}, function (err, supportUser) {
      if (err) {
        return done(err);
      }
      sera.model('users').findOne({email: talkEmail}, function (err, talkUser) {
        if (err) {
          return done(err);
        }
        sera.model('workflows').findOne({user: adminUser, name: 'model'}, function (err, workflow) {
          if (err) {
            return done(err);
          }
          sera.model('groups').findOne({user: adminUser, name: 'admin'}, function (err, admin) {
            if (err) {
              return done(err);
            }
            sera.model('groups').create({
              user: adminUser,
              name: 'support',
              description: 'serandives.com support group',
              workflow: workflow,
              status: workflow.start,
              visibility: {},
              permissions: {},
              _: {}
            }, function (err, support) {
              if (err) {
                return done(err);
              }
              sera.model('groups').update({_id: support._id}, {
                permissions: [{
                  user: supportUser._id,
                  actions: ['read', 'update', 'delete']
                }, {
                  group: admin._id,
                  actions: ['read', 'update', 'delete']
                }, {
                  group: support._id,
                  actions: ['read']
                }],
                visibility: {
                  '*': {
                    users: [supportUser._id],
                    groups: [admin._id, support._id]
                  }
                }
              }, function (err) {
                if (err) {
                  return done(err);
                }
                sera.model('groups').findOne({user: adminUser, name: 'public'}, function (err, pub) {
                  if (err) {
                    return done(err);
                  }
                  sera.model('groups').findOne({user: adminUser, name: 'anonymous'}, function (err, anon) {
                    if (err) {
                      return done(err);
                    }
                    sera.model('users').update({_id: supportUser.id}, {
                      groups: [support.id, pub.id],
                      visibility: {
                        '*': {
                          users: [adminUser._id, supportUser.id]
                        },
                        'username': {
                          groups: [anon.id, pub.id]
                        }
                      },
                      permissions: [{
                        group: admin._id,
                        actions: ['read', 'update', 'delete']
                      }, {
                        user: supportUser._id,
                        actions: ['read', 'update', 'delete']
                      }, {
                        group: support._id,
                        actions: ['read']
                      }, {
                        group: pub._id,
                        actions: ['read']
                      }, {
                        group: anon._id,
                        actions: ['read']
                      }]
                    }, function (err) {
                      if (err) {
                        return done(err);
                      }
                      sera.model('users').update({_id: talkUser.id}, {
                        groups: [support.id, pub.id],
                        visibility: {
                          '*': {
                            users: [adminUser._id, talkUser.id]
                          },
                          'username': {
                            groups: [anon.id, pub.id]
                          }
                        },
                        permissions: [{
                          group: admin._id,
                          actions: ['read', 'update', 'delete']
                        }, {
                          user: talkUser._id,
                          actions: ['read', 'update', 'delete']
                        }, {
                          group: support._id,
                          actions: ['read']
                        }, {
                          group: pub._id,
                          actions: ['read']
                        }, {
                          group: anon._id,
                          actions: ['read']
                        }]
                      }, function (err) {
                        if (err) {
                          return done(err);
                        }
                        log.info('groups:created');
                        done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};
