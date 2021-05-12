var log = require('logger')('service-models:test:create');
var errors = require('errors');
var _ = require('lodash');
var should = require('should');
var request = require('request');
var sera = require('sera');
var pot = require('pot');

describe('POST /models', function () {
    var client;
    var brand;
    var model;

    before(function (done) {
      pot.client(sera, function (err, c) {
        if (err) {
          return done(err);
        }

        client = c;

        request({
          uri: pot.resolve('apis', '/v/brands'),
          method: 'POST',
          json: {
            title: 'Mitsubishi',
            description: 'This is the Mitsubishi brand.',
            models: ['vehicles']
          },
          auth: {
            bearer: client.users[0].token
          }
        }, function (e, r, b) {
          if (e) {
            return done(e);
          }
          r.statusCode.should.equal(201);
          should.exist(b);
          should.exist(b.title);
          should.exist(b.description);

          brand = b;

          model = {
            brand: brand.id,
            model: 'vehicles',
            title: 'Lancer',
            description: 'This is the model Mitsubishi.'
          };

          done();
        });
      });
    });

    it('with no media type', function (done) {
        request({
            uri: pot.resolve('apis', '/v/models'),
            method: 'POST',
            auth: {
                bearer: client.users[0].token
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(errors.unsupportedMedia().status);
            should.exist(b);
            b = JSON.parse(b);
            should.exist(b.code);
            should.exist(b.message);
            b.code.should.equal(errors.unsupportedMedia().data.code);
            done();
        });
    });

    it('with unsupported media type', function (done) {
        request({
            uri: pot.resolve('apis', '/v/models'),
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml'
            },
            auth: {
                bearer: client.users[0].token
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(errors.unsupportedMedia().status);
            should.exist(b);
            b = JSON.parse(b);
            should.exist(b.code);
            should.exist(b.message);
            b.code.should.equal(errors.unsupportedMedia().data.code);
            done();
        });
    });

    it('without body', function (done) {
      request({
        uri: pot.resolve('apis', '/v/models'),
        method: 'POST',
        json: {},
        auth: {
          bearer: client.users[0].token
        }
      }, function (e, r, b) {
        if (e) {
          return done(e);
        }
        r.statusCode.should.equal(errors.unprocessableEntity().status);
        should.exist(b);
        should.exist(b.code);
        should.exist(b.message);
        b.code.should.equal(errors.unprocessableEntity().data.code);
        done();
      });
    });

    it('without title', function (done) {
      request({
        uri: pot.resolve('apis', '/v/models'),
        method: 'POST',
        json: {
          models: ['vehicles']
        },
        auth: {
          bearer: client.users[0].token
        }
      }, function (e, r, b) {
        if (e) {
          return done(e);
        }
        r.statusCode.should.equal(errors.unprocessableEntity().status);
        should.exist(b);
        should.exist(b.code);
        should.exist(b.message);
        b.code.should.equal(errors.unprocessableEntity().data.code);
        done();
      });
    });

    it('without models', function (done) {
      request({
        uri: pot.resolve('apis', '/v/models'),
        method: 'POST',
        json: {
          title: 'Mitsubishi'
        },
        auth: {
          bearer: client.users[0].token
        }
      }, function (e, r, b) {
        if (e) {
          return done(e);
        }
        r.statusCode.should.equal(errors.unprocessableEntity().status);
        should.exist(b);
        should.exist(b.code);
        should.exist(b.message);
        b.code.should.equal(errors.unprocessableEntity().data.code);
        done();
      });
    });

    var bigger = '';
    var i;
    for (i = 0; i < 200001; i++) {
        bigger += 'x';
    }

    it('valid', function (done) {
        request({
            uri: pot.resolve('apis', '/v/models'),
            method: 'POST',
            json: model,
            auth: {
                bearer: client.users[0].token
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(201);
            should.exist(b);
            should.exist(b.title);
            should.exist(b.model);
            should.exist(b.brand);
            should.exist(b.description);
            b.title.should.equal(model.title);
            b.model.should.equal(model.model);
            b.brand.should.equal(model.brand);
            b.description.should.equal(model.description);
            should.exist(r.headers['location']);
            r.headers['location'].should.equal(pot.resolve('apis', '/v/models/' + b.id));
            done();
        });
    });
});
