"use strict";
define(function(require, exports, module) {
  var DEFAULT_ICON = '/images/openbox.png';
  var DEFAULT_SIZE = 128;

  var mozApps = window.navigator.mozApps;

  // Gets all installed apps on your machine. Takes a callback with one
  // argument: a pretty-formatted list of apps. Requires URL of site to be
  // whitelisted in about:config (key = 'dom.mozApps.whitelist').
  // If you aren't whitelisted (or, for some other reason, the method fails)
  // a second callback argument can be used (where you should tell the user
  // what happened and how to fix it).
  function getAll(successCallback, errorCallback) {
    var apps = mozApps.mgmt.getAll();

    apps.addEventListener('success', function() {
      if (successCallback) {
        successCallback(apps.result);
      }
    });

    apps.addEventListener('error', function(event) {
      if (errorCallback) {
        errorCallback(event);
      }
    });
  }

  // mozApps.mgmt.getAll() spits out a LOT of info; let's wrap it nicely
  // and just return what we consider to be the "vital" stuff.
  function formattedAppsList(apps) {
    var list = [];

    apps.forEach(function(app) {
      list.push(wrapApp(app));
    });

    return list;
  }

  // Finds the best app icon given a sec of app icons in an app's manifest.
  // If the icons available are all too small; we'll load the "box" icon for
  // now.
  function getIconForSize(app, targetSize) {
    var manifest = app.manifest;

    if (targetSize === undefined) {
      targetSize = DEFAULT_SIZE;
    }

    if (manifest && manifest.icons) {
      var bestFit = 0;
      var biggestFallback = 0;

      for (var i in manifest.icons) {
        var iconSize = parseInt(DEFAULT_SIZE, 10);

        if (bestFit === 0 || iconSize >= targetSize) {
          bestFit = iconSize;
        }

        if (biggestFallback === 0 || iconSize > biggestFallback) {
          biggestFallback = iconSize;
        }
      }

      if ((bestFit !== 0 || biggestFallback !== 0) &&
          manifest.icons[bestFit || biggestFallback]) {
        // HACK: These paths ought be absolute, but we hack around them for now.
        // These SHOULD be absolute paths, but most (all?) of the manifets
        // in the Marketplace are NOT absolute, so we add prefixes to make
        // stuff work for now.
        return (app._origin || app.origin) +
               (manifest.launch_path ? manifest.launch_path : '') +
               (manifest.icons[bestFit || biggestFallback]);
      }
    }

    return DEFAULT_ICON;
  }

  // Wrap an app with normalized data. Thanks to persona.org for some of this.
  function wrapApp(app) {
    return {
      appObject: app,
      imageURL: getIconForSize(app),
      name: app.manifest.name,
      origin: app._origin || app.origin,
      recommendation: false
    };
  }

  // Wrap a recommendation with normalized data. Makes one look like an app for
  // EJS purposes.
  function wrapRecommendation(app) {
    return {
      appObject: app,
      imageURL: app.icon_url_128 || '/images/openbox.png',
      name: app.name,
      recommendation: true,
      url: app.absolute_url
    };
  }

  // Export our public API!
  return {
    formattedAppsList: formattedAppsList,
    getAll: getAll,
    wrapApp: wrapApp,
    wrapRecommendation: wrapRecommendation
  };
});
