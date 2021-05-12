var log = require('logger')('service-brands:test:find');
var should = require('should');
var request = require('request');
var sera = require('sera');
var pot = require('pot');
var mongoose = require('mongoose');
var errors = require('errors');

describe('GET /brands', function () {
  var client;

  var taxonomy;

  var data = {
    title: 'Custom',
    description: 'This is the custom brand.',
    models: ['vehicles']
  }

  before(function (done) {
    pot.client(sera, function (err, c) {
      if (err) {
        return done(err);
      }
      client = c;

      request({
        uri: pot.resolve('apis', '/v/brands'),
        method: 'POST',
        json: data,
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
        b.title.should.equal(data.title);
        should.exist(b.description);
        b.description.should.equal(data.description);
        should.exist(r.headers['location']);
        r.headers['location'].should.equal(pot.resolve('apis', '/v/brands/' + b.id));

        taxonomy = b;

        pot.publish('brands', b.id, client.users[0].token, client.admin.token, done);
      });
    });
  });

  it('anonymous', function (done) {
    request({
      uri: pot.resolve('apis', '/v/brands'),
      method: 'GET',
      json: true
    }, function (e, r, b) {
      if (e) {
        return done(e);
      }

      r.statusCode.should.equal(200);
      should.exist(b.length);
      b.length.should.be.above(0);

      b.forEach(function (b) {
        should.exist(b.title);
        should.exist(b.description);
      });

      done();
    });
  });

  it('logged in unauthorized', function (done) {
    request({
      uri: pot.resolve('apis', '/v/brands'),
      method: 'GET',
      auth: {
        bearer: client.users[1].token
      },
      json: true
    }, function (e, r, b) {
      if (e) {
        return done(e);
      }

      r.statusCode.should.equal(200);
      should.exist(b.length);
      b.length.should.be.above(0);

      b.forEach(function (b) {
        should.exist(b.title);
        should.exist(b.description);
      });

      done();
    });
  });
});
