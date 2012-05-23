"use strict";
var express = require('express');
var configurations = module.exports;
var app = express.createServer();
var settings;
var redis = require("redis");
var client = redis.createClient();

try {
  settings = require('./settings-local')(app, configurations, express);
} catch (e) {
  console.log('No local settings (settings-local.js) found; using defaults.');
  settings = require('./settings')(app, configurations, express);
}

// select the db
client.select(app.set('newnewtab-redis'), function(errDb, res) {
  console.log('PROD/DEV database connection status: ', res);
});

// Routes
// TODO: pass client to the routes if redis needed
require('./routes')(app);

app.listen(settings.options.port, function() {
  console.log('Express server listening on port %d in %s mode', app.address().port, app.settings.env);
});
