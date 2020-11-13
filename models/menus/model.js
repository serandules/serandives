var log = require('logger')('model-menus');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sera = require('sera');
var plugins = sera.plugins;
var validators = sera.validators;
var utils = sera.utils;


var types = validators.types;
var requires = validators.requires;

var schema = Schema({
    name: {
        type: String,
        required: true,
        validator: types.string({
            length: 200
        })
    },
    links: {
        type: String,
        required: true,
        validator: types.string({
            length: 10000
        })
    }
}, {collection: 'menus'});

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

module.exports = mongoose.model('menus', schema);
