var log = require('logger')('service-brands:test:find');
var should = require('should');
var request = require('request');
var pot = require('pot');
var errors = require('errors');

describe('GET /brands', function () {
    it('GET /brands', function (done) {
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
            b.forEach(function (brand) {
                should.exist(brand);
                should.exist(brand.id);
                should.exist(brand.title);
                should.not.exist(brand.__v);
            });
            done();
        });
    });

    it('GET /brands/:id', function (done) {
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
            var brand = b[0];
            should.exist(brand.id);
            should.exist(brand.title);
            request({
                uri: pot.resolve('apis', '/v/brands/' + brand.id),
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
                b.id.should.equal(brand.id)
                b.title.should.equal(brand.title)
                done();
            });
        });
    });
});