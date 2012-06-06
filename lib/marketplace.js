// API marketplace
var https = require('https');

/* modify the app attribute by adding link to marketplace and fake links to 
 * images
 */
function addFakeUrls(app) {
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

/* modify the app by adding links to marketplace
 */
function addUrls(app) {
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

/* provide fake data for recommendations
 */
function fakeRecommendations(callback) {
  callback(require('./fakedata').apps);
}

/* fetch all given recommendations from Marketplace
 * Marketplace is not providing a one URL to fetch all recommendations
 * instead we're fetching all categories and search for the apps
 * within each one of them
 * All fetched recommendations will be provided as callback attribute
 *
 * @param marketplaceAPIDomain domain which should be called
 *        "marketplace.mozilla.org"
 */
function fetchRecommendations(marketplaceAPIDomain, callback) {
  // number of all categories, will be needed for callback
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

  /* called after response received from the API /api/apps/category, 
   * handles the response and calls fetchApps for received category list
   */
  function fetchAppsByCategory(response) {
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

  /* called for each category,
   * searches for the apps and adds them to the recommendations object
   * calls the callback after apps for all categories are received
   */
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


/* stores the given recommendations in database
 *
 * @param dbClient () redis client
 * @param recommendations (object) object with category names as keys
 *        and an array of recommended apps as value
 */
function cacheRecommendations(dbClient, recommendations, callback) {
  // TODO: make sure callback is send after data is cached
  Object.keys(recommendations).forEach(function(category) {
    var list = recommendations[category];
    list.forEach(function(item) {
      addUrls(item);
    });
    dbClient.set('recommendation:' + category, JSON.stringify(list));
  });

  if (callback !== undefined) {
    callback();
  }
}

/* reads the recommendations from the database for given categories
 * recommendations are returned in callback attribute
 *
 * @param dbClient (redis-client) 
 * @param categories (array) list of category names
 */
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
      if (reply) {
        // prepare data
        apps[category] = JSON.parse(reply);
      } else if (err) {
        console.error(err);
      }
      if (++categoryIndex === categories.length) {
        callback(apps);
      }
    });
  });
}

/* increment the number of clicks for the webApp
 * returns current number of clicks as callback attribute
 *
 * @param dbClient (redis-client)
 * @param slug (String) unique app name
 */
function addClick(dbClient, slug, callback) {
  // TODO: we should somehow pass this info to the Marketplace
  var clicks = 1;

  dbClient.get('clicks:' + slug, function(err, reply) {
    if (reply) {
      clicks = parseInt(reply) + 1;
    } else if (err) {
      console.error(err);
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
