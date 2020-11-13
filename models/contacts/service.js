var log = require('logger')('service-contacts');

module.exports = function (done) {
  var service = {
    auth: {
      GET: [
        '^\/$',
        '^\/.*'
      ]
    },
    xactions: {
      post: {
        verify: require('./xactions/verify'),
        confirm: require('./xactions/confirm')
      }
    },
    createOne: true,
    findOne: true,
    find: true,
    updateOne: true,
    replaceOne: true,
    removeOne: true
  };

  done(null, service);
};

