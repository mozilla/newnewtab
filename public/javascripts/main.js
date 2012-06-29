'use strict';
const gMarketPlaceCats = [
  'BOOKS_AND_REFERENCE',
  'BUSINESS',
  'EDUCATION',
  'ENTERTAINMENT_AND_SPORTS',
  'GAMES',
  'HEALTH_AND_FITNESS',
  'LIFESTYLE',
  'MUSIC',
  'NEWS_AND_WEATHER',
  'SHOPPING',
  'SOCIAL_AND_COMMUNICATION',
  'TRAVEL',
  'UTILITIES'
];

define(function(require) {
  // Monkeypatch Array
  require('../javascripts/array');

  // HACK: require.js + potch's useful jQuery-like interface for modern browsers.
  var $ = require('../javascripts/lib/mu');
  $ = window.mu;

  var APP_URL = $('body')[0].dataset.appUrl;
  var LOCAL_APP_SQUARES = 8;
  var RECOMMENDATION_SQUARE = 2; // Default; loaded from localStorage later if available.

  var Apps = require('../javascripts/apps');
  // HACK: Load EJS with require.js.
  var EJS = require('../javascripts/lib/ejs_production');
  EJS = window.EJS;
  var Request = require('../javascripts/request');
  var console = window.console;
  var localStorage = window.localStorage;
  var installedApps;

  // Do it.
  init();

  // Do first-run stuff; app setup; etc.
  function init() {
    // Initialise localStorage variables if this is the first time we've ever
    // run this app.
    if (localStorage.getItem('firstRun') !== '1') {
      localStorage.recommendations = JSON.stringify([]);
      localStorage.savedPositions = JSON.stringify({});

      var request = new Request('/data/odp2mozilla.json' , function(request) {
        computeMarketPlaceCategories(JSON.parse(request.responseText));
      });

      // We've run once and initialized data.
      localStorage.firstRun = '1';
    }

    // If the recommendation square was moved by the user: place it there.
    if (window.localStorage.recommendationSquare !== undefined) {
      RECOMMENDATION_SQUARE = parseInt(window.localStorage.recommendationSquare, 10);
    }

    // Setup DOM listeners and such.
    setupDOM();
  }

  // Insert a list of apps into the DOM.
  function insertAppsIntoDOM(apps) {
    var cells = $('.cell:not(.app');
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
      if (count === cells.length || count === LOCAL_APP_SQUARES) {
        break;
      }
    }

    for (i in cells) {
      i = parseInt(i, 10);
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

  // Map user odp insterests to market place cats
  function computeMarketPlaceCategories(odp2MarketPlaceMapping) {
    // pull user ODP profile from the window
    window.getCategories(function(odpInterests) {
      // we must map odp results into marketplace categories
      var marketPlaceCats = {};
      var totalScore = 0;
      for (var odpCat in odpInterests) {
        var odpScore = odpInterests[odpCat];
        var mkrtCats = odp2MarketPlaceMapping[odpCat];

        for (var mrktCat in mkrtCats) {
           var mkrtScore = mkrtCats[mrktCat];
           if (!marketPlaceCats[mrktCat]) {
             marketPlaceCats[mrktCat] = 0;
           }
           marketPlaceCats[mrktCat] += mkrtScore * odpScore;
           totalScore += mkrtScore * odpScore;
        } // end of inner for
      } // end of outer for

      // now go back to marketPlaceCats and normalize by totalScore
      for (var cat in marketPlaceCats) {
        marketPlaceCats[cat] = Math.ceil(marketPlaceCats[cat] * 100 / totalScore);
      }

      // save it to the localstorage
      localStorage.marketPlaceCats = JSON.stringify(marketPlaceCats);
    });
  }

  // recommend a marketplace category
  function recommnedMarketPlaceCategory() {
    try {
      // check if we have marketplace cats ready
      if (localStorage.marketPlaceCats) {
        // so we do - perform a walk on random number since the categories have
        // weight that totals to 100 we should choose a random number between 0
        // and 100 and walk the categories substructing the weight from the
        // original number. When number turns negative we found the category to
        // recommend
        var marketPlaceCats = JSON.parse(localStorage.marketPlaceCats);
        var random = Math.floor(Math.random() * 100);
        for (var cat in marketPlaceCats) {
          var weight = marketPlaceCats[cat];
          random -= weight;
          if (random < 0) {
            return cat;
          }
        } // end of for
      } // end of if
    } // end of try
    catch (ex) {
      console.log("Error: " + ex);
    }

    // whatever went wrong, simply return a market place category at random
    var random = Math.floor(Math.random() * gMarketPlaceCats.length);
    return gMarketPlaceCats[random];
  }

  // Load recommendations and insert one into the DOM. The previous
  // recommendation (if one exists) will be shown automatically, so this will
  // update that one (hopefully quickly).
  function insertRecommendationIntoDOM(recommendations) {
    if (!recommendations) {
      recommendations = JSON.parse(localStorage.recommendations);

      if (recommendations.length === 0) {
        console.log('No recommendations available.');
        return;
      }
    }

    var app = Apps.wrapRecommendation(recommendations['Games'].random());
    var template = new EJS({url: '/templates/recommendation.ejs'});
    $('.cell')[RECOMMENDATION_SQUARE].outerHTML = template.render({recommendation: app});
  }

  // Listen for drag events on the cells in the page.
  function setupCellDragAndDrop() {
    var originalElement;

    $('#grid').delegate('dragstart', '.cell', function(event) {
      originalElement = this;
      event.dataTransfer.effectAllowed = 'link';
      event.dataTransfer.setData('text/html', this.outerHTML);
    });

    $('#grid').delegate('dragover', '.cell', function(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'link';

      return false;
    });

    $('#grid').delegate('drop', '.cell', function(event) {
      if (this !== originalElement) {
        originalElement.outerHTML = this.outerHTML;
        this.outerHTML = event.dataTransfer.getData('text/html');

        // If we're moving the recommendation square, we remember its location.
        if (originalElement.classList.contains('recommendation')) {
          var cells = $('.cell');
          for (var i in cells) {
            if (cells.hasOwnProperty(i)) {
              if (cells[i].classList.contains('recommendation')) {
                localStorage.recommendationSquare = i;
                break;
              }
            }
          }
        }
      }

      event.preventDefault();
      event.stopPropagation();
      return false;
    });
  }

  // Do any DOM-related setup here. Listen for clicks on apps to launch them;
  // get/display list of apps; insert recommendation into the page.
  function setupDOM() {
    window.addEventListener('load', function() {
      // Check for mozApps API, because feature detection is very polite.
      if (!window.navigator.mozApps) {
        $('#grid')[0].outerHTML = new EJS({
          url: '/templates/browser-error.ejs'
        }).render();

        return;
      }

      // When an app is clicked on, launch it.
      $('#grid').delegate('click', '.app', function(event) {
        installedApps[this.dataset.appId].launch();
        event.preventDefault();
      });

      // Listen for drag and drop of cells.
      setupCellDragAndDrop();

      // Get all apps installed and insert recently installed ones into empty
      // squares.
      Apps.getAll(function(results) {
        var recommendedCat = recommnedMarketPlaceCategory();
        console.log('Category Recommendation', recommendedCat);
        var request = new Request('/recommendations.json?categories=' + recommendedCat, updateRecommendations);

        // Reverse stuff to show newest apps first.
        results.reverse();

        // Keep our list of installed apps in a variable.
        installedApps = results;

        // Get the eight most recently installed apps.
        var appsToInsert = Apps.formattedAppsList(results).slice(-LOCAL_APP_SQUARES);

        // Insert the most recently installed apps into the DOM.
        insertAppsIntoDOM(appsToInsert);
        insertRecommendationIntoDOM();
      }, function(event) { // Error; probably not whitelisted.
        // Show an error message with instructions on whitelisting.
        $('#grid')[0].outerHTML = new EJS({
          url: '/templates/apps-error.ejs'
        }).render({appURL: APP_URL});
      });
    });
  }

  // Get new recommendations from the server. Afterward, update the DOM with
  // new recommendations.
  function updateRecommendations(request) {
    if (request.status === 200) {
      var newRecommendations = JSON.parse(request.responseText);
      var oldRecommendations = JSON.parse(localStorage.getItem('recommendations'));
      localStorage.setItem('recommendations', request.responseText);

      insertRecommendationIntoDOM(newRecommendations);
    }
  }
});
