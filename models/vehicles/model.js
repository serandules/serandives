var log = require('logger')('model-vehicles');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var locations = require('../locations');

var sera = require('sera');
var plugins = sera.plugins;
var validators = sera.validators;
var utils = sera.utils;


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
    type: {
        type: String,
        validator: types.string({
            enum: [
                'bicycle',
                'excavator',
                'loader',
                'bulldozer',
                'digger',
                'tractor',
                'truck',
                'cement-mixer',
                'crane',
                'road-roller',
                'motorbike',
                'three-wheeler',
                'scooter',
                'car',
                'van',
                'suv',
                'cab',
                'lorry',
                'van',
                'bus',
                'other'
            ]
        }),
        required: true,
        searchable: true
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: 'brands',
        validator: types.ref(),
        required: true,
        searchable: true
    },
    model: {
        type: Schema.Types.ObjectId,
        ref: 'models',
        validator: types.ref(),
        required: true,
        searchable: true
    },
    edition: {
        type: String,
        validator: types.string({
            length: 50
        })
    },
    manufacturedAt: {
        type: Date,
        validator: types.date({
            max: Date.now
        }),
        required: true,
        searchable: true,
        sortable: true
    },
    fuel: {
        type: String,
        validator: types.string({
            enum: ['none', 'petrol', 'diesel', 'electric', 'hybrid', 'other']
        }),
        required: true,
        searchable: true
    },
    transmission: {
        type: String,
        validator: types.string({
            enum: ['manual', 'automatic', 'manumatic', 'other']
        }),
        required: true,
        searchable: true
    },
    engine: {
        type: Number,
        validator: types.number({
            max: 20000
        }),
        require: requires.engine()
    },
    driveType: {
        type: String,
        validator: types.string({
            enum: ['front', 'rear', 'four', 'all', 'other']
        }),
        require: requires.driveType(),
        searchable: true
    },
    mileage: {
        type: Number,
        validator: types.number({
            min: 0
        }),
        required: true,
        searchable: true,
        sortable: true
    },
    condition: {
        type: String,
        validator: types.string({
            enum: ['brand-new', 'unregistered', 'used']
        }),
        required: true,
        searchable: true
    },
    color: {
        type: String,
        validator: types.string({
            enum: ['black', 'white', 'grey', 'silver', 'red', 'blue', 'green', 'orange', 'purple', 'brown', 'pink', 'yellow', 'other']
        }),
        required: true,
        searchable: true
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
            max: 5,
            min: 1,
            validator: types.ref()
        })
    }
}, {collection: 'vehicles'});

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
    server: {
        location: Locations.tagger
    }
}));

utils.ensureIndexes(schema, [
    {price: 1, updatedAt: 1, _id: 1},
    {price: 1, updatedAt: -1, _id: -1}
]);

module.exports = mongoose.model('vehicles', schema);
