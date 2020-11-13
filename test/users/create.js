var log = require('logger')('service-users:test:create');
var errors = require('errors');
var should = require('should');
var request = require('request');
var pot = require('pot');

describe('POST /users', function () {

  before(pot.unthrottle);

  it('with extended name', function (done) {
    request({
      uri: pot.resolve('apis', '/v/users'),
      method: 'POST',
      headers: {
        'X-Captcha': 'dummy'
      },
      json: {
        email: 'extended-user@serandives.com',
        password: '1@2.Com',
        username: 'extended-user',
        name: 'Extended User'
      }
    }, function (e, r, b) {
      if (e) {
        return done(e);
      }
      r.statusCode.should.equal(201);
      should.exist(b);
      should.exist(b.id);
      should.exist(b.email);
      should.exist(b.name);
      b.email.should.equal('extended-user@serandives.com');
      b.name.should.equal('Extended User');
      should.exist(r.headers['location']);
      r.headers['location'].should.equal(pot.resolve('apis', '/v/users/' + b.id));
      done();
    });
  });
});
