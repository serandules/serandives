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
            models: ['vehicles', 'phones'],
            title: 'Mitsubishi'
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
          b.title.should.equal('Mitsubishi');
          should.exist(r.headers['location']);
          r.headers['location'].should.equal(pot.resolve('apis', '/v/brands/' + b.id));
          brand = b.id;
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
          brand: brand
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
          title: 'X1'
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

    it.only('valid', function (done) {
        request({
            uri: pot.resolve('apis', '/v/models'),
            method: 'POST',
            json: {
              title: 'X1',
              model: 'vehicles',
              brand: brand
            },
            auth: {
                bearer: client.users[0].token
            }
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            console.log(b)
            r.statusCode.should.equal(201);
            should.exist(b);
            should.exist(b.title);
            b.title.should.equal('X1');
            should.exist(r.headers['location']);
            r.headers['location'].should.equal(pot.resolve('apis', '/v/models/' + b.id));
            done();
        });
    });
});
