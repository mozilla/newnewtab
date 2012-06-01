"use strict";
var express = require('express');
var configurations = module.exports;
var app = express.createServer();
var settings;
var redis = require("redis");
var dbClient = redis.createClient();
var marketplace = require('../lib/marketplace');

try {
  settings = require('../settings-local')(app, configurations, express);
} catch (e) {
  console.log('No local settings (settings-local.js) found; using defaults.');
  settings = require('../settings')(app, configurations, express);
}

// select the db
dbClient.select(app.set('newnewtab-redis'), function(errDb, res) {
  console.log('PROD/DEV database connection status: ', res);
});

marketplace.fetchRecommendations(
    app.set('marketplace_api_domain'), function(recommendations) {
  console.log('[debug] recommendations fetched');
  marketplace.cacheRecommendations(dbClient, recommendations, function() {
    console.log('[debug] recommendations cached')
    // all done
    process.exit();
  });
});
