"use strict";
var express = require('express');
var configurations = module.exports;
var app = express.createServer();
var settings;
var redis = require('redis');
var dbClient = redis.createClient();
var conf = require('nconf');
var path = require('path');
var fs = require('fs');

require('./lib/conf').loadDefaultConf(console.log,
    path.join(__dirname, './config-local.json'));

settings = require('./settings')(app, configurations, express);

// select the db
dbClient.select(conf.get('redis:dbId'), function(errDb, res) {
  console.log('Database (', conf.get('redis:dbId'), ') connection status: ', res);
});

// Routes
require('./routes')(app, dbClient);
require('./routes/fetch')(app, dbClient, settings);
require('./routes/count')(app, dbClient);

app.listen(settings.options.port, function() {
  console.log('Express server listening on port %d in %s mode', app.address().port, app.settings.env);
});
