"use strict";
var express = require('express');
var configurations = module.exports;
var app = express.createServer();
var settings;
var redis = require('redis');
var client = redis.createClient();
var conf = require('nconf');
var path = require('path');

// default config
conf.add('local-file', {'type': 'file', 
  file: path.join(__dirname, './config-local.json')});

var current_env = process.env['DEV_ENV'] || 'development';
conf.add('env-file', {'type': 'file', 
  file: path.join(__dirname, './config-' + current_env + '.json')});

conf.add('default-file', {'type': 'file', 
  file: path.join(__dirname, './config-default.json')});

settings = require('./settings')(app, configurations, express);

// select the db
client.select(conf.get('redis:dbId'), function(errDb, res) {
  console.log('Database (', conf.get('redis:dbId'), ') connection status: ', res);
});

// Routes
// TODO: pass client to the routes if redis needed
require('./routes')(app, client);
require('./routes/fetch')(app, client, settings);

app.listen(settings.options.port, function() {
  console.log('Express server listening on port %d in %s mode', app.address().port, app.settings.env);
});
