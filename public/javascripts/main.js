define(function(require) {
  var LOCAL_APP_SQUARES = 8;
  var Apps = require('../javascripts/apps');
  var installedApps;

  $().ready(function() {
    $('.app').live('click', function(event) {
      installedApps[$(this).data('app-id')].launch();
      event.preventDefault();
    });

    Apps.getAll(function(results) {
      installedApps = results;
      insertAppsIntoDOM(Apps.formattedAppsList(results));
    });
  });

  // Insert a list of apps into the DOM.
  function insertAppsIntoDOM(apps) {
    var count = 0;
    for (var i in apps) {
      apps[i].html = new EJS({url: '/templates/app.ejs'}).render({app: apps[i], i: i});

      count++;
      if (count === LOCAL_APP_SQUARES) {
        break;
      }
    }

    $('.cell').each(function(i) {
      $(this).replaceWith(apps[i].html).show();
    });
  }
});
