"use strict";

var express = require('express');
var configurations = module.exports;
var app = express.createServer();
var settings = require('./settings')(app, configurations, express);

// Routes
require('./routes')(app);
require('./routes/auth')(app, settings);

app.listen(settings.options.port, function() {
  console.log('Express server listening on port %d in %s mode', app.address().port, app.settings.env);
});
