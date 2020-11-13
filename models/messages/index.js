
exports.model = require('./model');

exports.service = function (done) {
  done(null, {
    auth: {
      GET: [
        '^\/$',
        '^\/.*'
      ],
      POST: [
        '^\/$'
      ]
    },
    workflow: 'model-messages',
    find: true,
    findOne: true,
    createOne: true,
    updateOne: true,
    replaceOne: true,
    removeOne: true
  });
};