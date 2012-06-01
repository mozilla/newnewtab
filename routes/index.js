var Marketplace = require('../lib/marketplace');

module.exports = function(app, redisClient) {
  // This is technically a race condition, but it's only for testing purposes!
  Marketplace.fetchRecommendations(function(apps) {
    Marketplace.cacheRecommendations(redisClient, apps);
  });

  // Home/main
  app.get('/', function(req, res) {
    res.render('index', { title: 'New Tab' });
  });

  app.get('/recommendations.json', function(req, res) {
    console.log(req.query);
    var categories = req.query['categories'].split(',');
    console.log(categories);
    Marketplace.getRecommendations(redisClient, categories, function(apps) {
      res.json(apps);
    });
  });
};
