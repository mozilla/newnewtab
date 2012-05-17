// Module dependencies.
module.exports = function(app, configurations, express) {
  var clientSessions = require('client-sessions');
  var i18n = require('i18n-abide');

  var options = {
    domain: 'http://localhost',
    // This is the port that binds to the node server - Apache/Nginx will likely proxy from here
    port: process.env['VCAP_APP_PORT'] || process.env['PORT'] || 3000,
    // This is the port that browserid requires for the actual site - 80 for http, 443 for https
    authPort: 3000,
    authUrl: 'https://browserid.org'
  };

  // Configuration
  app.configure(function() {
    app.use(i18n.abide({
      supported_languages: ['en-US'],
      default_lang: 'en-US',
      debug_lang: 'it-CH', // See: https://github.com/mozilla/i18n-abide#debugging-and-testing
      locale_directory: 'locale'
    }));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    // app.set('view options', { layout: false });
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.compiler({ src:  __dirname + '/public', enable: ['less'] }));
    app.use(express.static(__dirname + '/public'));
    app.use(clientSessions({
      cookieName: 'session_newnewtab',
      secret: 'secret', // MUST be set
      // true session duration:
      // will expire after duration (ms)
      // from last session.reset() or
      // initial cookieing.
      duration: 24 * 60 * 60 * 1000 * 7, // 1 week
    }));
    app.use(express.csrf());
    app.use(app.router);
  });

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
