var log = require('logger')('service-models:test:find');
var should = require('should');
var request = require('request');
var pot = require('pot');
var _ = require('lodash');
var errors = require('errors');

describe('GET /models', function () {
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

    var findBrand = function (b) {
        return _.find(b, function (brand) {
            return brand.title === 'Other';
        });
    };

    it('GET /models', function (done) {
        request({
            uri: pot.resolve('apis', '/v/brands'),
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
            var brand = findBrand(b);
            should.exist(brand.id);
            should.exist(brand.title);
            request({
                uri: pot.resolve('apis', '/v/models'),
                qs: {
                    data: JSON.stringify({
                        query: {
                            brand: brand.id
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

    it('GET /models/:id', function (done) {
        request({
            uri: pot.resolve('apis', '/v/brands'),
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
            var brand = findBrand(b);
            should.exist(brand.id);
            should.exist(brand.title);
            request({
                uri: pot.resolve('apis', '/v/models'),
                qs: {
                    data: JSON.stringify({
                        query: {
                            brand: brand.id
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
                    uri: pot.resolve('apis', '/v/models/' + model.id),
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
});
