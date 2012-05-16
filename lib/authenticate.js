var request = require('request');

/* Browser ID authentication
 * Requires: web request, settings
 * Returns: A browser Id email if successful
 */
exports.verify = function(req, settings, callback) {
  var authUrl = settings.options.authUrl + '/verify';
  var siteUrl = settings.options.domain + ':' + settings.options.authPort;

  if (!req.body.bid_assertion) {
    return false;
  }

  var qs = {
    assertion: req.body.bid_assertion,
    audience: siteUrl
  };

  var params = {
    url: authUrl,
    form: qs
  };

  request.post(params, function(err, resp, body) {
    var email = false;

    if (err) {
      return callback(err);
    }

    try {
      var jsonResp = JSON.parse(body);
      if (!err && jsonResp.status === 'okay') {
        email = jsonResp.email;
      } else {
        return callback(err);
      }
    } catch (err) {
      return callback(err);
    }

    return callback(null, email);
  });

  return true;
};
