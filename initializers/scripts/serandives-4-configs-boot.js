var log = require('logger')('initializers:serandives:configs-boot');
var nconf = require('nconf');

var sera = require('sera');
var commons = require('../commons');

var googleKey = nconf.get('GOOGLE_KEY');
var staticsCDN = nconf.get('CDN_STATICS');
var imagesCDN = nconf.get('CDN_IMAGES');

module.exports = function (done) {
  commons.meta(function (err, o) {
    if (err) {
      return done(err);
    }
    sera.model('configs').findOne({
      user: o.adminUser,
      name: 'boot'
    }, function (err, boot) {
      if (err) {
        return done(err);
      }

      var o = JSON.parse(boot.value);

      o.googleKey = googleKey;
      o.cdns = {
        statics: staticsCDN,
        images: imagesCDN
      };

      sera.model('configs').update({
        _id: boot._id
      }, {
        value: JSON.stringify(o)
      }, function (err) {
        if (err) {
          return done(err);
        }
        log.info('configs:boot updated');
        done();
      });
    });
  });
};
