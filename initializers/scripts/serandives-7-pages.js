var log = require('logger')('initializers:serandives:pages');
var async = require('async');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var sera = require('sera');
var commons = require('../commons');

var pages = [
  {alias: '/about', title: 'About Us', body: 'about.html'},
  {alias: '/contact', title: 'Contact Us', body: 'contact.html'},
  {alias: '/help', title: 'Help', body: 'help.html'},
  {alias: '/privacy', title: 'Privacy Policy', body: 'privacy.html'},
  {alias: '/terms', title: 'Terms of Use', body: 'terms.html'},
  {alias: '/prohibited', title: 'Prohibited Items', body: 'prohibited.html'}
]

module.exports = function (done) {
  commons.meta(function (err, o) {
    if (err) {
      return done(err);
    }
    var visibility = _.cloneDeep(o.visibility);
    visibility.title = {
      groups: [o.public._id, o.anonymous._id]
    };
    visibility.body = {
      groups: [o.public._id, o.anonymous._id]
    };
    async.eachSeries(pages, function (page, seriesDone) {
      fs.readFile(path.join(__dirname, '..', 'pages', page.body), function (err, data) {
        if (err) {
          return seriesDone(err);
        }
        sera.model('pages').create({
          user: o.adminUser,
          title: page.title,
          body: data,
          workflow: o.workflows.model,
          status: 'published',
          permissions: o.permissions,
          visibility: visibility,
          _: {}
        }, function (err, p) {
          if (err) {
            return seriesDone(err);
          }
          sera.model('configs').findOne({
            user: o.adminUser,
            name: 'aliases'
          }, function (err, o) {
            if (err) {
              return seriesDone(err);
            }
            var aliases = JSON.parse(o.value);
            aliases[page.alias] = p.id;
            sera.model('configs').update({_id: o._id}, {
              value: JSON.stringify(aliases)
            }, seriesDone);
          });
        });
      });
    }, function (err) {
      if (err) {
        return done(err);
      }
      log.info('pages:created');
      done();
    });
  });
};
