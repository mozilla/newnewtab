// API marketplace

var add_urls = function(app) {
    // modify the app by adding links to apps
    var app_url = '/apps/' + app.slug;
    app['marketplace_url'] = app_url;
    app['icon_url'] = app_url + '/icon';
    if (app.screenshots) {
        app['screenshots_urls'] = [];
        app.screenshots.forEach(function(screenshot) {
            app.screenshots_urls.push(app_url + '/screenshot/' + screenshot);
        });
    }
};

var fake_recommendations = function (categories, callback) {
    // returns an object - list of apps ordered by categories
    // get recommendations from the fake data object
    var fake = require('./fakedata');
    var apps = {};
    categories.forEach(function(category) {
        var category_apps = fake.apps[category];
        category_apps.forEach(function(app) {
            // add_urls(app);
            var app_url = '/apps/' + app.slug;
            app['marketplace_url'] = app_url;
            app['icon_url'] = 'http://lorempixel.com/264/184';
            if (app.screenshots) {
                app['screenshots_urls'] = [];
                app.screenshots.forEach(function(screenshot) {
                    app.screenshots_urls.push('http://lorempixel.com/300/200');
                });
            }
        });
        apps[category] = category_apps;
    });
    callback(apps);
}

exports.get_recommendations = fake_recommendations;
