var assert = require('should');
var auth = require('../lib/authenticate');
var nock = require('nock');

var settings = {};
settings.options = {
  domain: 'http://localhost',
  port: 3000,
  authUrl: 'https://browserid.org'
};

var authUrl = settings.options.authUrl + '/verify';
var siteUrl = settings.options.domain + ':' + settings.options.port;
var qs = { assertion: '1a2b3c', audience: siteUrl };

describe('login', function() {
  describe('POST /verify', function() {
    it('logs the user in when they have good credentials', function() {
      var scope = nock(authUrl).post('', qs).reply(200, { status: 'okay', email: 'bela@test.org' });

      var params = {
        body: { bid_assertion: qs.assertion }
      };

      var authResp = auth.verify(params, settings, function(error, email) { });
      authResp.should.equal(true);
    });

    it('does not log the user in if they have bad credentials', function() {
      var scope = nock(authUrl).post('', qs).reply(500, { status: 'invalid' });

      var params = {
        body: { }
      };

      var authResp = auth.verify(params, settings, function(error, email) { });
      authResp.should.equal(false);
    });
  });
});
