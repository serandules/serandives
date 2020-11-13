var log = require('logger')('model-binaries');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sera = require('sera');
var plugins = sera.plugins;
var validators = sera.validators;
var utils = sera.utils;

var types = validators.types;

var schema = Schema({
  type: {
    type: String,
    required: true,
    validator: types.binaryType()
  },
  content: {
    type: String,
    required: true,
    validator: types.binary()
  }
}, {collection: 'binaries'});

schema.plugin(plugins());
schema.plugin(plugins.user());
schema.plugin(plugins._({
  workflow: 'model'
}));
schema.plugin(plugins.permissions({
  workflow: 'model'
}));
schema.plugin(plugins.status({
  workflow: 'model'
}));
schema.plugin(plugins.visibility({
  workflow: 'model'
}));
schema.plugin(plugins.createdAt());
schema.plugin(plugins.updatedAt());
schema.plugin(plugins.modifiedAt());

utils.ensureIndexes(schema, [
  {updatedAt: 1, _id: 1}
]);

module.exports = mongoose.model('binaries', schema);
