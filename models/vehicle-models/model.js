var log = require('logger')('model-vehicle-models');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sera = require('sera');
var plugins = sera.plugins;
var validators = sera.validators;
var utils = sera.utils;


var types = validators.types;

var schema = Schema({
    title: {
        type: String,
        required: true,
        validator: types.title({
            length: 100
        })
    },
    make: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'vehicle-makes',
        validator: types.ref(),
        searchable: true
    }
}, {collection: 'vehicle-models'});

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

module.exports = mongoose.model('vehicle-models', schema);
