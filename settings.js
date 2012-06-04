// Module dependencies.
module.exports = function(app, configurations, express) {
  var appCache = require('connect-app-cache');
  var clientSessions = require('client-sessions');
  var i18n = require('i18n-abide');
  var conf = require('nconf');

  // overriding port with optional environment variables
  var options = conf.get('express');
  options.port = process.env['VCAP_APP_PORT'] || process.env['PORT'] || options.port;

  // Configuration
  app.configure(function() {
    app.use(i18n.abide(conf.get('locale')));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    // app.set('view options', { layout: false });
    // app.use(appCache('newnewtab.appcache', __dirname + '/newnewtab.appcache'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.compiler({ src:  __dirname + '/public', enable: ['less'] }));
    app.use(express.static(__dirname + '/public'));
    app.use(clientSessions(conf.get('sessions')));
    app.use(express.csrf());
    app.use(app.router);
  });

  app.set('newnewtab-redis', conf.get('redis:dbId'));

  app.configure('development, test', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('production', function() {
    app.use(express.errorHandler());
  });

  app.dynamicHelpers({
    session: function (req, res) {
      return req.session;
    },
    token: function(req, res) {
      return req.session._csrf;
    }
  });

  configurations.app = app;
  configurations.options = options;

  return configurations;
};
