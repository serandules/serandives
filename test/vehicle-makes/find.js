var log = require('logger')('service-vehicle-makes:test:find');
var should = require('should');
var request = require('request');
var pot = require('pot');
var errors = require('errors');

describe('GET /vehicle-makes', function () {
    it('GET /vehicle-makes', function (done) {
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
            b.forEach(function (make) {
                should.exist(make);
                should.exist(make.id);
                should.exist(make.title);
                should.not.exist(make.__v);
            });
            done();
        });
    });

    it('GET /vehicle-makes/:id', function (done) {
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
            var make = b[0];
            should.exist(make.id);
            should.exist(make.title);
            request({
                uri: pot.resolve('apis', '/v/vehicle-makes/' + make.id),
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
                b.id.should.equal(make.id)
                b.title.should.equal(make.title)
                done();
            });
        });
    });
});