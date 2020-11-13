var log = require('logger')('model-messages');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sera = require('sera');
var plugins = sera.plugins;
var validators = sera.validators;
var utils = sera.utils;


var types = validators.types;
var requires = validators.requires;

var schema = Schema({
    to: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        validator: types.ref(),
        required: true
    },
    type: {
        type: String,
        validator: types.string({
            enum: ['message', 'violation', 'bug', 'enhancement', 'invalid', 'other']
            // sold/unavailable/violation/abuse/bug/message/enhancement/scam/fraud/duplicate/spam/invalid/offensive/other
            // violation/bug/message/enhancement/duplicate/invalid/other
        }),
        required: true,
        searchable: true
    },
    model: {
        type: String,
        validator: types.string({
            enum: [
                'binaries',
                'clients',
                'configs',
                'contacts',
                'grants',
                'groups',
                'locations',
                'menus',
                'messages',
                'otps',
                'pages',
                'realestates',
                'tiers',
                'tokens',
                'users',
                'vehicle-makes',
                'vehicle-models',
                'vehicles',
                'workflows'
            ]
        }),
        require: requires.messageAbout(),
        searchable: true
    },
    about: {
        type: Schema.Types.ObjectId,
        validator: types.ref(),
        require: requires.messageAbout(),
        searchable: true
    },
    body: {
        type: String,
        required: true,
        validator: types.string({
            length: 5000
        })
    }
}, {collection: 'messages'});

schema.plugin(plugins());
schema.plugin(plugins.user({
    optional: true
}));
schema.plugin(plugins._({
    workflow: 'model-messages'
}));
schema.plugin(plugins.permissions({
    workflow: 'model-messages'
}));
schema.plugin(plugins.status({
    workflow: 'model-messages'
}));
schema.plugin(plugins.visibility({
    workflow: 'model-messages'
}));
schema.plugin(plugins.createdAt());
schema.plugin(plugins.updatedAt());
schema.plugin(plugins.modifiedAt());

utils.ensureIndexes(schema, [
    {updatedAt: 1, _id: 1}
]);

module.exports = mongoose.model('messages', schema);
