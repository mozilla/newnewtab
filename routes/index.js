var Marketplace = require('../lib/marketplace');

module.exports = function(app, redisClient) {
  // Home/main
  app.get('/', function(req, res) {
    res.render('index', { title: 'New Tab' });
  });

  app.get('/recommendations.json', function(req, res) {
    var categories = req.query['categories'] ? req.query['categories'].toLowerCase().split(',') : null;
    Marketplace.getRecommendations(redisClient, categories, function(apps) {
      res.json(apps);
    });
  });
};
