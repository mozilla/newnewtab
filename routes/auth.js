var auth = require('../lib/authenticate');

module.exports = function(app, settings) {
  // Csrf check filter for pages with forms
  var checkCSRF = function(req, res, next) {
    if (req.session._csrf !== req.body._csrf) {
      res.redirect('/');
    } else {
      next();
    }
  };

  // Login
  app.post('/login', checkCSRF, function(req, res) {
    auth.verify(req, settings, function(error, email) {
      if (email) {
        req.session.email = email;
      }
      res.redirect('/dashboard');
    });
  });

  // Logout
  app.get('/logout', function(req, res) {
    req.session.email = null;
    req.session._csrf = null;
    res.redirect('/');
  });
};