"use strict";
define(function(require, exports, module) {
  var DEFAULT_ICON = '/images/openbox.png';
  var DEFAULT_SIZE = 128;

  var mozApps = window.navigator.mozApps;
  
  // Count the number of categories in a list of apps.
  function countCategories(results) {

  }

  // Gets all installed apps on your machine. Takes a callback with one
  // argument: a pretty-formatted list of apps. Requires URL of site to be
  // whitelisted in about:config (key = 'dom.mozApps.whitelist').
  function getAll(callback) {
    var apps = mozApps.mgmt.getAll();

    apps.addEventListener('success', function() {
      callback(apps.result);
    });

    apps.addEventListener('error', function(event) {
      console.log(event);
    });
  }

  // Get a list of categories of apps installed, along with the number of each
  // app category installed.
  function getCategories(callback) {
    getAll(countCategories(results));
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
      console.log(manifest.icons);
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
      imageURL: app.icon_url,
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
/*

var DEFAULT_ICON = '/images/default-icon.png';
var DEFAULT_SIZE = 128;

var Class = require('shipyard/class/Class');
var EventEmitter = require('shipyard/class/Events');
var ObservableArray = require('shipyard/class/ObservableArray');
var utils = require('shipyard/utils/object');
var dom = require('shipyard/dom');
var navigator = dom.window.get('navigator');
var mozApps = navigator.mozApps;

var logging = require('shipyard/utils/log');
var log = logging.getLogger('apps.api');

function getIconForSize(targetSize, app) {
  var manifest = app.manifest;

  if (manifest && manifest.icons) {
    var bestFit = 0;
    var biggestFallback = 0;

    utils.forEach(manifest.icons, function(icon, defaultSize) {
      var iconSize = parseInt(defaultSize, 10);

      if (bestFit === 0 || iconSize >= targetSize) {
        bestFit = iconSize;
      }

      if (biggestFallback === 0 || iconSize > biggestFallback) {
        biggestFallback = iconSize;
      }

      console.log('test');
    });
    
    if (bestFit !== 0 || biggestFallback !== 0) {
      var icon = manifest.icons[bestFit || biggestFallback];
      return icon;
    }
  }
  return DEFAULT_ICON;
}

function wrapApp(app) {
  return {
    origin: app._origin || app.origin,
    title: app.manifest.name,
    imageURL: getIconForSize(DEFAULT_SIZE, app),
    appObject: app
  };
}

function indexOf(arr, app) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].origin === app.origin) {
      return i;
    }
  }
  return -1;
}

function gotApps(apps) {
  var list = new ObservableArray();

  for (var i = 0; i < apps.length; i ++) {
    var currentApp = apps[i];
    list.push(wrapApp(currentApp));
  }

  return list;
}



module.exports = new Class({

  Implements: EventEmitter,

  initialize: function API() {
    var api = this;
    if (mozApps && mozApps.mgmt) {
      mozApps.mgmt.oninstall = function(ev) {
        log.debug('mgmt.oninstall', ev.application.origin);
        api.emit('install', ev.application);
      };

      mozApps.mgmt.onuninstall = function(ev) {
        log.debug('mgmt.onuninstall', ev.application.origin);
        api.emit('uninstall', ev.application);
      };
    }
  },

  getInstalled: function getInstalled() {
    var api = this;

    var pending = mozApps.mgmt.getAll();
    var emitter = new EventEmitter();

    pending.onsuccess = function () {
      var installedApps = gotApps(pending.result);
      emitter.apps = installedApps;
      emitter.result = pending.result;
      api.addListener('install', function(app) {
        installedApps.push(wrapApp(app));
      });
      api.addListener('uninstall', function(app) {
        var index = indexOf(installedApps, app);
        if (index > -1) {
          installedApps.splice(index, 1);
        }
      });
      emitter.emit('success', emitter.apps);
    };

    pending.onerror = function () {
      emitter.emit('error');
    };
    return emitter;
  },

  uninstall: function uninstall(app) {
    var pending = app.uninstall();
    var emitter = new EventEmitter();

    pending.onsuccess = function() {
      emitter.emit('success', 200);
    };

    pending.onerror = function () {
      emitter.emit('error');
    };
    return emitter;
  }

});
*/
