var express = require('express'), 
    assert = require('assert'),
    marketplace = require('../lib/marketplace');

describe('FakeData', function() {
    describe('recommendations', function() {
        marketplace.get_recommendations(['Business', 'Education', 'Games'], 
            function(apps) {
                assert(apps['Business']);
            }
        );
    })
})


