"use strict";
define(function(require, exports, module) {
  var mozApps = window.navigator.mozApps;

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

  // mozApps.mgmt.getAll() spits out a LOT of info; let's wrap it nicely
  // and just return what we consider to be the "vital" stuff.
  function formattedAppsList(apps) {
    var list = [];

    apps.forEach(function(app) {
      list.push(app.manifest);
    });

    return list;
  }

  // Export our public API!
  return {
    formattedAppsList: formattedAppsList,
    getAll: getAll,
  };
});
