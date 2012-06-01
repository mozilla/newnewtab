'use strict';
define(function(require) {
  var $ = window.µ; // potch's useful jQuery-like interface for modern browsers.
  var LOCAL_APP_SQUARES = 8;
  var RECOMMENDATION_SQUARE = window.localStorage.recommendationSquare || 2;
  var TOTAL_CELLS = $('.cell').length;

  var Apps = require('../javascripts/apps');
  var Request = require('../javascripts/request');
  var localStorage = window.localStorage;
  var installedApps;

  window.addEventListener('load', function() {
    $('#grid').delegate('click', '.cell', function(event) {
      if (this.dataset.appId === undefined) {
        return;
      }

      installedApps[this.dataset.appId].launch();
      event.preventDefault();
    });

    Apps.getAll(function(results) {
      // Reverse stuff to show newest apps first.
      results.reverse();

      // Keep our list of installed apps in a variable.
      installedApps = results;

      // Get the eight most recently installed apps.
      var appsToInsert = Apps.formattedAppsList(results).slice(-LOCAL_APP_SQUARES);

      // Insert the most recently installed apps into the DOM.
      insertAppsIntoDOM(appsToInsert);
    });

    // var request = new Request('/recommendations.json?categories=Games', updateRecommendations);
    insertRecommendationIntoDOM(JSON.parse(window.localStorage.getItem('recommendations')));
  });

  // Insert a list of apps into the DOM.
  function insertAppsIntoDOM(apps) {
    var cells = $('.cell');
    var count = 0;
    var i;
    var recommendationInserted = 0; // We use a number because it negates using a ternary.
    var savedPositions = localStorage.savedPositions;

    for (i in apps) {
      apps[i].html = new EJS({url: '/templates/app.ejs'}).render({
        app: apps[i],
        i: i
      });

      count++;
      if (count === LOCAL_APP_SQUARES) {
        break;
      }
    }

    for (i in cells) {
      i = parseInt(i);
      // Don't use the recommendation square for an app.
      if (cells.hasOwnProperty(i)) {
        if (i === RECOMMENDATION_SQUARE) {
          recommendationInserted = 1;
          continue;
        }

        cells[i].outerHTML = apps[i - recommendationInserted].html;
      }
    }
  }

  // Load recommendations and insert one into the DOM. The previous
  // recommendation (if one exists) will be shown automatically, so this will
  // update that one (hopefully quickly).
  function insertRecommendationIntoDOM(recommendations) {
    var app = Apps.wrapRecommendation(recommendations['Games'][0].objects[0]);
    var template = new EJS({url: '/templates/recommendation.ejs'});
    $('.cell')[RECOMMENDATION_SQUARE].outerHTML = template.render({recommendation: app});
  }

  function updateRecommendations(request) {
    if (request.status === 200) {
      var newRecommendations = JSON.parse(request.responseText);
      var oldRecommendations = JSON.parse(window.localStorage.getItem('recommendations'));
      window.localStorage.setItem('recommendations', request.responseText);
    }

    insertRecommendationIntoDOM(newRecommendations);

    return;
  }
});
