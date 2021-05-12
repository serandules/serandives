var log = require('logger')('service-models:test:find');
var should = require('should');
var request = require('request');
var pot = require('pot');
var _ = require('lodash');
var errors = require('errors');
var sera = require('sera');

describe('GET /models', function () {
  var client;
  var brand;

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

        request({
          uri: pot.resolve('apis', '/v/models'),
          method: 'POST',
          json: {
            brand: brand.id,
            model: 'vehicles',
            title: 'Lancer',
            description: 'This is the model Mitsubishi.'
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
          should.exist(b.model);
          should.exist(b.brand);
          should.exist(b.description);
          should.exist(r.headers['location']);
          r.headers['location'].should.equal(pot.resolve('apis', '/v/models/' + b.id));
          done();
        });
      });
    });
  });

  it('GET /models', function (done) {
    request({
      uri: pot.resolve('apis', '/v/models'),
      qs: {
        data: JSON.stringify({
          query: {
            brand: brand.id
          }
        })
      },
      auth: {
        bearer: client.users[0].token
      },
      method: 'GET',
      json: true
    }, function (e, r, b) {
      if (e) {
        return done(e);
      }
      r.statusCode.should.equal(200);
      should.exist(b);
      should.exist(b.length);
      b.length.should.be.above(0);
      b.forEach(function (model) {
        should.exist(model.id);
        should.exist(model.title);
        should.not.exist(model.__v);
      });
      done();
    });
  });

  it('GET /models buy brand', function (done) {
    request({
      uri: pot.resolve('apis', '/v/models'),
      qs: {
        data: JSON.stringify({
          query: {
            brand: brand.id
          }
        })
      },
      auth: {
        bearer: client.users[0].token
      },
      method: 'GET',
      json: true
    }, function (e, r, b) {
      if (e) {
        return done(e);
      }
      r.statusCode.should.equal(200);
      should.exist(b);
      should.exist(b.length);
      b.length.should.be.above(0);
      var model = b[0];
      request({
        uri: pot.resolve('apis', '/v/models/' + model.id),
        method: 'GET',
        auth: {
          bearer: client.users[0].token
        },
        json: true
      }, function (e, r, b) {
        if (e) {
          return done(e);
        }
        r.statusCode.should.equal(200);
        should.exist(b);
        should.exist(b.id);
        should.exist(b.title);
        should.exist(b.brand);
        b.id.should.equal(model.id);
        b.title.should.equal(model.title);
        b.brand.should.equal(model.brand);
        should.not.exist(model.__v);
        done();
      });
    });
  });
});
