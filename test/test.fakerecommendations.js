var express = require('express');
var assert = require('assert');
var marketplace = require('../lib/marketplace');

describe('FakeData', function() {
    describe('recommendations', function() {
        it('should contain Business', function(){ 
            marketplace.get_recommendations(['Business', 'Education', 'Games'], 
                function(apps) {
                    assert(apps['Business']);
                }
            );
        });
    });
});
