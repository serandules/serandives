var log = require('logger')('service-vehicle-models:test:find');
var should = require('should');
var request = require('request');
var pot = require('pot');
var _ = require('lodash');
var errors = require('errors');

describe('GET /vehicle-models', function () {
    var client;
    /*before(function (done) {
      pot.client(function (err, c) {
        if (err) {
          return done(err);
        }
        client = c;
        done();
      });
    });*/

    var findMake = function (b) {
        return _.find(b, function (make) {
            return make.title === 'Other';
        });
    };

    it('GET /vehicle-models', function (done) {
        request({
            uri: pot.resolve('apis', '/v/vehicle-makes'),
            method: 'GET',
            json: true
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(200);
            should.exist(b);
            should.exist(b.length);
            b.length.should.be.above(1);
            var make = findMake(b);
            should.exist(make.id);
            should.exist(make.title);
            request({
                uri: pot.resolve('apis', '/v/vehicle-models'),
                qs: {
                    data: JSON.stringify({
                        query: {
                            make: make.id
                        }
                    })
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
    });

    it('GET /vehicle-models/:id', function (done) {
        request({
            uri: pot.resolve('apis', '/v/vehicle-makes'),
            method: 'GET',
            json: true
        }, function (e, r, b) {
            if (e) {
                return done(e);
            }
            r.statusCode.should.equal(200);
            should.exist(b);
            should.exist(b.length);
            b.length.should.be.above(1);
            var make = findMake(b);
            should.exist(make.id);
            should.exist(make.title);
            request({
                uri: pot.resolve('apis', '/v/vehicle-models'),
                qs: {
                    data: JSON.stringify({
                        query: {
                            make: make.id
                        }
                    })
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
                    uri: pot.resolve('apis', '/v/vehicle-models/' + model.id),
                    method: 'GET',
                    json: true
                }, function (e, r, b) {
                    if (e) {
                        return done(e);
                    }
                    r.statusCode.should.equal(200);
                    should.exist(b);
                    should.exist(b.id);
                    should.exist(b.title);
                    should.exist(b.make);
                    b.id.should.equal(model.id);
                    b.title.should.equal(model.title);
                    b.make.should.equal(model.make);
                    should.not.exist(model.__v);
                    done();
                });
            });
        });
    });
});
