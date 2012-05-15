// API marketplace
var request = require('request');

exports.get_recommendations - function (categories, callback) {
    // returns an object - list of apps ordered by categories
    // get an object from the the cache
    var apps = {
        'Business': [{
            "slug": "your-test-app", 
            "name": "My cool app", 
            "screenshots": [1 , 2, 3]],
        }],
        'Education': [],
        'Games': []
    };
    // callback the apps
    callback(apps);
}
