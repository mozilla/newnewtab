var marketplace = require('../lib/marketplace');
var conf = require('nconf');

module.exports = function(app, dbClient, settings) {

  if (process.env['NODE_ENV'] !== 'production') {
    // only if not in production - helpfull to immediate test the
    // results from marketplace
    app.get('/fetch_recommendations', function(req, res) {
      // fetch all recommendations from Marketplace API
      // and cache in local database
      // :returns: JSON with a status info
      marketplace.fetchRecommendations(conf.get('marketplaceAPIDomain'), 
          function(recommendations) {
        console.log('[debug] recommendations fetched');
        marketplace.cacheRecommendations(dbClient, recommendations, function() {
          console.log('[debug] recommendations cached')
          res.send(recommendations);
        });
      });
    });
  }
}
