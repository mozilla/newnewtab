"use strict";
define(function(require, exports, module) {
  // An extremely simple API for making AJAX requests.
  function Request(url, callback, options) {
    var request = new XMLHttpRequest();

    if (options === undefined) {
      options = {};
    }

    options.method = options.method || 'GET';

    request.open(options.method, url);
    request.onreadystatechange = function(event) {
      if (request.readyState === request.DONE) {
        callback(request);
      }
    };
    request.send(options.data || null);
  }

  // Export our public API!
  return Request;
});
