var log = require('logger')('service-brands:test:create');
var errors = require('errors');
var _ = require('lodash');
var should = require('should');
var request = require('request');
var sera = require('sera');
var pot = require('pot');

describe('POST /brands', function () {
  var client;
  before(function (done) {
    pot.client(sera, function (err, c) {
      if (err) {
        return done(err);
      }
      client = c;
      done();
    });
  });

  var data = {
    title: 'Honda',
    description: 'This is the honda brand.',
    models: ['vehicles']
  };

  it('with no media type', function (done) {
    request({
      uri: pot.resolve('apis', '/v/brands'),
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
      uri: pot.resolve('apis', '/v/brands'),
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

  it('without title', function (done) {
    request({
      uri: pot.resolve('apis', '/v/brands'),
      method: 'POST',
      json: {
        description: 'This is a sample taxonomy'
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

  it('without description', function (done) {
    request({
      uri: pot.resolve('apis', '/v/brands'),
      method: 'POST',
      json: {
        title: 'Title'
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

  it('with bigger description', function (done) {
    request({
      uri: pot.resolve('apis', '/v/brands'),
      method: 'POST',
      json: {
        title: 'Title',
        description: bigger
      },
      auth: {
        bearer: client.users[0].token
      }
    }, function (e, r, b) {
      if (e) {
        return done(e);
      }
      r.statusCode.should.equal(errors.payloadTooLarge().status);
      should.exist(b);
      should.exist(b.code);
      should.exist(b.message);
      b.code.should.equal(errors.payloadTooLarge().data.code);
      done();
    });
  });

  it('valid', function (done) {
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
      done();
    });
  });
});
