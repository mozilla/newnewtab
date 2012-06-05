// API marketplace
var https = require('https');


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

function fakeRecommendations(callback) {
  // provide fake data for recommendations
  callback(require('./fakedata').apps);
}

function fetchRecommendations(marketplaceAPIDomain, callback) {
  var catCount;
  var catIndex = 0;
  var recommendations = {};

  console.log('[debug] fetching recommendations from ' + 
      marketplaceAPIDomain + '/en-US/api/apps/category/');
  var cOpts = {
    host: marketplaceAPIDomain,
    path: '/en-US/api/apps/category/'
  };
  var request = https.get(cOpts, fetchAppsByCategory).on('error', function(err) {
    console.error(err);
  });

  function fetchAppsByCategory(response) {
    // fetch all categories from marketplace and then fetch apps for
    // each of them
    var data = "";
    response.setEncoding('utf8');
    response.on('data', function onData(chunk) {
      data += chunk;
    });
    response.on('end', function onEnd() {
      // fetchApps for each category
      var cats = JSON.parse(data).objects;
      catCount = cats.length;
      console.log('[debug] fetching apps for ' + cats.length + ' categories');
      cats.forEach(fetchApps);
    });
  };

  function fetchApps(category) {
    // fetch apps for given category
    var aOpts = {
      host: marketplaceAPIDomain,
      path: '/en-US/api/apps/search/?limit=3&cat=' + category.id
    };
    var request = https.get(aOpts, function(response) {
      var data = "";
      response.setEncoding('utf8');
      response.on('data', function onData(chunk) {
        data += chunk;
      });
      response.on('end', function onEnd() {
        var apps = JSON.parse(data).objects;
        console.log('[debug] ' + apps.length + ' apps fetched for ' + category.name);
        recommendations[category.name] = apps;
        if (++catIndex === catCount) {
          // received final response
          callback(recommendations);
        }
      });
    }).on('error', function(err) {
      console.error(err);
    });
  };
};


function cacheRecommendations(dbClient, recommendations, callback) {
  // place fetched recommendations in the cache
  // TODO: make sure callback is send after data is cached
  Object.keys(recommendations).forEach(function(category) {
    var list = recommendations[category];
    list.forEach(function(item) {
      addFakeUrls(item);
    });
    dbClient.set('recommendation:' + category, JSON.stringify(list));
  });

  if (callback !== undefined) {
    callback();
  }
}

function getRecommendations(dbClient, categories, callback) {
  // returns an object - list of apps ordered by categories
  // get recommendations from the cache
  var apps = {};
  var categoryIndex = 0;
  if (!categories) {
    return callback(apps);
  }
  categories.forEach(function(category) {
    dbClient.get('recommendation:' + category, function(err, reply) {
      if (err) {
        console.error(err);
      } else if (reply) {
        // prepare data
        apps[category] = JSON.parse(reply);
      }

      if (++categoryIndex === categories.length) {
        callback(apps);
      }
    });
  });
}

function addClick(dbClient, slug, callback) {
  // increment the number of clicks for the webApp
  // TODO: we should somehow pass this info to the Marketplace
  var clicks = 1;
  dbClient.get('clicks:' + slug, function(err, reply) {
    if (err) {
      console.error(err);
    } else if (reply) {
      clicks = parseInt(reply) + 1;
    }
    saveClick();
  });
  function saveClick() {
    dbClient.set('clicks:' + slug, clicks, function() {
      console.log('[debug] ' + slug + ' clicked ' + clicks + ' times');
      if (callback) {
        callback(clicks);
      }
    });
  };
};

exports.getRecommendations = getRecommendations;
exports.fetchRecommendations = fetchRecommendations;
exports.cacheRecommendations = cacheRecommendations;
exports.addClick = addClick;
