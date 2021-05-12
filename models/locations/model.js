var log = require('logger')('model-locations');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sera = require('sera');
var plugins = sera.plugins;
var validators = sera.validators;
var utils = sera.utils;

var tagger = require('./tagger');

var types = validators.types;
var requires = validators.requires;

var schema = Schema({
    latitude: {
        type: Number,
        required: true,
        validator: types.number({
            max: 90,
            min: -90
        })
    },
    longitude: {
        type: Number,
        required: true,
        validator: types.number({
            max: 180,
            min: -180
        })
    },
    name: {
        type: String,
        validator: types.string({
            length: 200
        })
    },
    line1: {
        type: String,
        required: true,
        validator: types.string({
            length: 200
        })
    },
    line2: {
        type: String,
        validator: types.string({
            length: 200
        })
    },
    city: {
        type: String,
        required: true,
        validator: types.string({
            length: 100
        })
    },
    postal: {
        type: String,
        required: true,
        validator: types.string({
            length: 100
        })
    },
    district: {
        type: String,
        require: requires.district(),
        validator: types.string({
            length: 100
        })
    },
    province: {
        type: String,
        require: requires.province(),
        validator: types.string({
            length: 100
        })
    },
    state: {
        type: String,
        require: requires.state(),
        validator: types.string({
            length: 100
        })
    },
    country: {
        type: String,
        required: true,
        validator: types.country({
            allow: ['LK']
        })
    }
}, {collection: 'locations'});

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

schema.statics.tagger = tagger;

module.exports = mongoose.model('locations', schema);
