"use strict";
var redis = require("redis");
var dbClient = redis.createClient();
var marketplace = require('../lib/marketplace');
var conf = require('nconf');
var path = require('path');

conf.add('local-file', {'type': 'file', 
  file: path.join(__dirname, '../config-local.json')});

var current_env = process.env['DEV_ENV'] || 'development';
conf.add('env-file', {'type': 'file', 
  file: path.join(__dirname, '../config-' + current_env + '.json')});

conf.add('default-file', {'type': 'file', 
  file: path.join(__dirname, '../config-default.json')});

// select the db
dbClient.select(conf.get('redis:dbId'), function(errDb, res) {
  console.log('Database (', conf.get('redis:dbId'), ') connection status: ', res);
});

marketplace.fetchRecommendations(
    conf.get('marketplaceAPIDomain'), function(recommendations) {
  console.log('[debug] recommendations fetched');
  marketplace.cacheRecommendations(dbClient, recommendations, function() {
    console.log('[debug] recommendations cached')
    // all done
    process.exit();
  });
});
