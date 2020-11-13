
exports.model = require('./model');

exports.service = function (done) {
  done(null, {
    auth: {
      GET: [
        '^\/$',
        '^\/.*'
      ]
    },
    find: true,
    findOne: true
  });
};