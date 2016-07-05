var assert = require('chai').assert;
var config = require('../config');
var ssllabs = require('../ssllabs');

describe('Test domain', function () {

    config.domains.forEach(function (domain) {
        describe(domain, function () {
            this.timeout(300000);

            var result;

            before(function (done) {
                ssllabs(domain).then(function (analyzeResult) {
                    result = analyzeResult;
                    done();
                });
            });

            it('should have run a test', function () {
                assert.isDefined(result, 'Test did not run');
            });

            after(function () {
                result.endpoints.forEach(function (endpoint) {
                    describe(domain + ' (' + endpoint.ipAddress + ')', function () {
                        it('should have at least an A grade', function () {
                            assert.isDefined(endpoint.grade, 'Did not get a grade');
                            assert.include(endpoint.grade.toLowerCase(), 'a', 'Grade is B or lower');
                        });

                        it('should not have any warnings', function () {
                            assert.isNotOk(endpoint.hasWarnings, 'Result has warnings');
                        });
                    });
                });
            });
        });
    });
});