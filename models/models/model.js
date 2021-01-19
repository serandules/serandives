var log = require('logger')('model-models');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sera = require('sera');
var plugins = sera.plugins;
var validators = sera.validators;
var utils = sera.utils;

var modelUtils = require('../../utils/models');

var types = validators.types;

var schema = Schema({
    title: {
        type: String,
        required: true,
        validator: types.title({
            length: 100
        })
    },
    brand: {
        type: Schema.Types.ObjectId,
        required: true,
        validator: modelUtils.brand(),
        searchable: true
    },
    model: {
        type: String,
        required: true,
        validator: modelUtils.model()
    }
}, {collection: 'models'});

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
  {updatedAt: -1, _id: -1}
]);

module.exports = mongoose.model('models', schema);
