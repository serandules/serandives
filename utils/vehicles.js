var _ = require('lodash');
var sera = require('sera');
var utils = sera.utils;

exports.makes = function (done) {
  sera.model('brands').find({models: 'vehicles'}).select('id title').exec(function (err, brands) {
    if (err) {
      return done(err);
    }
    brands = _.map(brands, utils.json);
    var brandsById = _.keyBy(brands, 'id');
    sera.model('models').find({model: 'vehicles'}).select('id title brand').exec(function (err, models) {
      if (err) {
        return done(err);
      }
      models = _.map(models, utils.json);
      models.forEach(function (model) {
        var brand = brandsById[model.brand];
        var models = brand.models || (brand.models = []);
        models.push(model);
      });
      done(null, brands);
    });
  });
};