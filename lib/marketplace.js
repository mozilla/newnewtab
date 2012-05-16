// API marketplace
var fake = require('./fakedata');

exports.get_recommendations = function (categories, callback) {
    // returns an object - list of apps ordered by categories
    // get an object from the the cache
    var apps = {
        'Business': fake.apps['Business'],
        'Education': fake.apps['Education'],
        'Games': fake.apps['Games']
    };
    callback(apps);
}
