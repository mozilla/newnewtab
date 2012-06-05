var conf = require('nconf');
var redis = require('redis');
var dbClient = redis.createClient();

var assert = require('assert');

var marketplace = require('../lib/marketplace');

var callback = function() {};

dbClient.select(conf.get('redis:testDbId'));


describe('Clicks', function() {


  describe('existing', function() {
    var slug = 'some-slug';

    beforeEach(function(){
      // create a slug with clicks
      dbClient.set('clicks:' + slug, 1, callback);
    });

    it('should increment clicks', function() {
      marketplace.addClick(dbClient, slug, function(clicks) {
        assert(clicks === 2);
        dbClient.get('clicks:' + slug, function(err, reply) {
          assert(reply === '2');
        });
      });
    });
  });

  describe('existing', function() {
    var slug = 'new-slug';

    beforeEach(function(){
      // create a slug with clicks
      dbClient.del('clicks:' + slug, callback);
    });

    it('should create entry with a click and add to it', function() {
      marketplace.addClick(dbClient, slug, function(clicks) {
        assert(clicks === 1);
        dbClient.get('clicks:' + slug, function(err, reply) {
          assert(reply === '1');
          marketplace.addClick(dbClient, slug, function(clicks) {
            assert(clicks === 2);
            dbClient.get('clicks:' + slug, function(err, reply) {
              assert(reply === '2');
            });
          });
        });
      });
    });
  });
});
