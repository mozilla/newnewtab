module.exports = function(app) {
  /* Filter for checking if a user is authenticated before
   * they can access views that require login
   */
  var isAuthenticated = function(req, res, next) {
    if (!req.session.email) {
      res.redirect('/');
    } else {
      next();
    }
  };

  // Home/main
  app.get('/', function(req, res) {
    res.render('index', { title: 'New Tab' });
  });
}
