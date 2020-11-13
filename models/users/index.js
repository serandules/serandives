var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var sera = require('sera');
var validators = sera.validators;
var types = validators.types;

exports.plugins = function (model, done) {
  model.plugin(function (schema, options) {
    schema.add({
      name: {
        type: String,
        validator: types.name({
          length: 200
        })
      },
      avatar: {
        type: Schema.Types.ObjectId,
        ref: 'binaries',
        validator: types.ref()
      },
      birthday: {
        type: Date,
        validator: types.birthday()
      },
      location: {
        type: Schema.Types.ObjectId,
        ref: 'locations',
        validator: types.ref()
      },
      contact: {
        type: Schema.Types.ObjectId,
        ref: 'contacts',
        validator: types.ref()
      }
    });
  });

  done();
};