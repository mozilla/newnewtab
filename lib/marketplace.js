// API marketplace
function addFakeUrls(app) {
  // modify the app by adding link to marketplace and fake links to images
  var appUrl = '/apps/' + app.slug;
  app['marketplace_url'] = appUrl;
  app['icon_url'] = 'http://lorempixel.com/264/184';
  if (app.screenshots) {
    app['screenshots_urls'] = [];
    app.screenshots.forEach(function(screenshot) {
      app.screenshots_urls.push('http://lorempixel.com/300/200');
    });
  }
}

function addUrls(app) {
  // modify the app by adding links to marketplace
  var appUrl = '/apps/' + app.slug;
  app['marketplace_url'] = appUrl;
  app['icon_url'] = appUrl + '/icon';
  if (app.screenshots) {
    app['screenshots_urls'] = [];
    app.screenshots.forEach(function(screenshot) {
      app.screenshots_urls.push(appUrl + '/screenshot/' + screenshot);
    });
  }
}

function fetchRecommendations(callback) {
  // fetch recommendations from Marketplace
  callback(require('./fakedata').apps);
}

function cacheRecommendations(client, recommendations, callback) {
  // place fetched recommendations in the cache
  Object.keys(recommendations).forEach(function(category) {
    var list = recommendations[category];
    list.forEach(function(item) {
      addFakeUrls(item);
    });
    client.set('recommendation:' + category, JSON.stringify(list));
  });

  if (callback !== undefined) {
    callback();
  }
}

function getRecommendations(client, categories, callback) {
  // returns an object - list of apps ordered by categories
  // get recommendations from the cache
  var apps = {};
  var categoryIndex = 0;
  categories.forEach(function(category) {
    client.get('recommendation:' + category, function(err, reply) {
      if (err) {
        console.log(err);
      } else if (reply) {
        // prepare data
        apps[category] = JSON.parse(reply);
      }

      categoryIndex++;

      if (categoryIndex === categories.length) {
        client.end();
        callback(apps);
      }
    });
  });
}

exports.getRecommendations = getRecommendations;
exports.fetchRecommendations = fetchRecommendations;
exports.cacheRecommendations = cacheRecommendations;
