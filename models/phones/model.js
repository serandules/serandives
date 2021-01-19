var log = require('logger')('model-phones');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var sera = require('sera');
var plugins = sera.plugins;
var validators = sera.validators;
var utils = sera.utils;

var locations = require('../locations');
var Locations = locations.model;

var types = validators.types;
var requires = validators.requires;

var schema = Schema({
    location: {
        type: Schema.Types.ObjectId,
        ref: 'locations',
        validator: types.ref(),
        required: true
    },
    contact: {
        type: Schema.Types.ObjectId,
        ref: 'contacts',
        validator: types.ref(),
        required: true
    },
    title: {
        type: String,
        validator: types.string({
            length: 100
        })
    },
    price: {
        type: Number,
        validator: types.number({
            min: 0
        }),
        required: true,
        searchable: true,
        sortable: true
    },
    currency: {
        type: String,
        validator: types.string({
            enum: ['LKR']
        }),
        required: true
    },
    description: {
        type: String,
        validator: types.string({
            length: 5000
        })
    },
    images: {
        type: [Schema.Types.ObjectId],
        ref: 'binaries',
        validator: types.array({
            max: 10,
            min: 1,
            validator: types.ref()
        })
    },
    type: {
        type: String,
        validator: types.string({
            enum: [
                'android',
                'iphone',
                'tablet',
                'wired'
            ]
        }),
        required: true,
        searchable: true
    },
    condition: {
        type: String,
        validator: types.string({
            enum: [
                'used',
                'new',
                'refurbished'
            ]
        }),
        required: true,
        searchable: true
    },
    condition: {
        type: String,
        validator: types.string({
            enum: [
                'used',
                'new',
                'refurbished'
            ]
        }),
        required: true,
        searchable: true
    }
}, {collection: 'phones'});

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
schema.plugin(plugins.tags({
    location: Locations.tagger
}));

utils.ensureIndexes(schema, [
    {price: 1, updatedAt: 1, _id: 1},
    {price: 1, updatedAt: -1, _id: -1}
]);

module.exports = mongoose.model('phones', schema);
