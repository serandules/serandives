var log = require('logger')('models:binaries:service');

var errors = require('errors');
var sera = require('sera');
var services = sera.services;
var middlewares = sera.middlewares;
var Binaries = require('./model');

var plugins = {
  image: require('./plugins/image')
};

var update = function (plugin, found, stream, data, done) {
  if (!stream) {
    return done(null, data);
  }
  plugin(found.id, stream.path, function (err) {
    if (err) {
      return done(err);
    }
    data.content = found.id;
    done(null, data);
  });
};

module.exports = function (done) {
  var service = {
    auth: {},
    updateOne: true,
    findOne: true,
    find: true,
    removeOne: true
  };

  service.createOne = function (req, res, next) {
    middlewares.serve(req, res, next,
      middlewares.multipart,
      middlewares.create(Binaries),
      function (req, res, next) {
        var stream = req.streams.content;
        stream = stream[0];
        var data = req.body;
        var type = data.type;
        var plugin = plugins[type];
        if (!plugin) {
          log.error('binaries:no-plugin', 'type:%s', type);
          return res.pond(errors.serverError());
        }
        data.content = 'dummy';
        services.create(req.ctx, function (err, binary) {
          if (err) {
            return next(err);
          }
          var id = binary.id;
          plugin(id, stream.path, function (err) {
            if (err) {
              log.error('binaries:create:plugin-error', 'id:%s type:%s path:%s', id, type, stream.path, err);
              Binaries.remove({_id: id}, function (err) {
                if (err) {
                  log.error('binaries:remove-failed', err);
                }
              });
              return res.pond(errors.serverError());
            }
            Binaries.update({_id: id}, {content: id}, function (err) {
              if (err) {
                log.error('binaries:update-content', err);
                return res.pond(errors.serverError());
              }
              binary.content = id;
              res.locate(id).status(201).send(binary);
            });
          });
        });
      });
  };

  service.replaceOne = function (req, res, next) {
    middlewares.serve(req, res, next,
      middlewares.id,
      middlewares.multipart,
      middlewares.update(Binaries),
      function (req, res, next) {
        var stream = req.streams.content || [];
        stream = stream[0];
        var found = req.ctx.found;
        var data = req.ctx.data;
        var type = data.type;
        var plugin = plugins[type];
        if (!plugin) {
          log.error('binaries:no-plugin', 'type:%s', type);
          return next(errors.serverError());
        }
        update(plugin, found, stream, data, function (err, data) {
          if (err) {
            return next(err);
          }
          services.update(req.ctx, function (err, binary) {
            if (err) {
              return next(err);
            }
            res.locate(binary.id).status(200).send(binary);
          });
        });
      });
  };

  done(null, service);
};

