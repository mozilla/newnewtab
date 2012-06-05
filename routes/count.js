var marketplace = require('../lib/marketplace');
var conf = require('nconf');

module.exports = function(app, dbClient) {

  app.get('/clicked/:slug', function(req, res) {
    // send click info to the back-end
    // :attribute: slug (string) string identification of the webApp 
    marketplace.addClick(dbClient, req.params.slug, function(clicks) {
      res.send({message: 'success', clicks: clicks});
    });
  });

  app.post('/clicked_to/:slug', function(req, res) {
    // send click info to the back-end and redirect to provided URL
    // :attribute: slug (string) string identification of the webApp 
    // :post: wabAppUrl (string) required, full URL of the webApp
    marketplace.addClick(dbClient, req.params.slug, function() {
      console.log('[debug] redirecting to ' + req.body.webAppUrl);
      res.redirect(req.body.wabAppUrl);
    });
  });
}

