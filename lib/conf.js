var fs = require('fs');
var nconf = require('nconf');
var path = require('path');

/* :method: loadConfFiles
 *   combines all provided configuration files.
 *   non existing files are ignored
 *   :arguments: 
 *      * [log method] (function) optional 
 *      * list of JSON configuration files
 *
 *   :usage: 
 *      require('./lib/conf').loadConfFiles('fileA.json', 'fileB.json');
 *      require('./lib/conf').loadConfFiles(console.log, 'A.json', 'B.json');
 */
function loadConfFiles(confFiles) {
  confFiles = Array.prototype.slice.call(arguments);
  var log = function(){};
  if (typeof confFiles[0] === 'function') {
    log = confFiles.shift();
  }

  confFiles.forEach(function(file) {
    try {
      fs.lstatSync(file);
      log('LOADING ' + file);
    } catch(e) {
      delete confFiles[confFiles.indexOf(file)];
      var error = 'IGNORED ' + file;
      if (e.errno === 34) {
        error +=' (file doesn\'t exist)';
      }
      log(error);
    }
  });

  return nconf.defaults(nconf.loadFilesSync(confFiles));
}

/* :method: loadDefaultConf
 *   combines default with optional provided configuration files.
 *   default files are:
 *      * config-default.json
 *      * config-{DEV_ENV}.json
 *   non existing files are ignored
 *   :arguments: 
 *      * [log method] (function) optional 
 *      * list of JSON configuration files [optional]
 *
 *   :usage: 
 *      require('./lib/conf').loadDefaultConf('config-local.json');
 *      require('./lib/conf').loadDefaultConf(console.log, 'A.json', 'B.json');
 */
function loadDefaultConf() {
  var currentEnv = process.env['DEV_ENV'] || 'development';
  var defaultFiles = [
    path.join(__dirname, '../config-default.json'),
    path.join(__dirname, '../config-' + currentEnv + '.json')];
  var args = Array.prototype.slice.call(arguments);
  var log = function(){};

  if (typeof args[0] === 'function') {
    log = args.shift();
  }

  return loadConfFiles.apply(this, [].concat(log, defaultFiles, args));
}

module.exports.loadConfFiles = loadConfFiles;
module.exports.loadDefaultConf = loadDefaultConf;
