newnewtab
=========

newnewtab is a project to enhance Firefox users' apps experience. When opening
a new tab, they are offered their own (currently installed) tabs, along with
one or more recommended apps.

It is planned for recommendations to be targeted, yet privacy-preserving. 

You may find development wiki_ valuable.

Install
#######

* install node_ and redis_ 
* clone the repository
* install dependencies using npm_
  ``npm install -d``
* run application
  ``node app``


.. _node: http://nodejs.org
.. _npm: http://npmjs.org
.. _redis: http://redis.io
.. _wiki: https://wiki.mozilla.org/Apps/newnewtab

mozApps Whitelist
#################

In order to get this to work at all, you'll need to whitelist the address
newnewtab is running from in your `about:config` in Firefox (tested in version
15+ -- i.e. Nightly). Basically, open up your `about:config` and add the key:
`dom.mozApps.whitelist`. Make sure `localhost:3000` (or wherever newnewtab is
running from) is there so it can access your installed apps!

Settings
########

By default, settings are in ``settings.js``. You can override settings in there
with environment variables, but if you want to customize lots of settings
locally (either for development or deployment), you can make a copy of
``settings-local.js-dist`` (``cp setting-local.js-dist settings-local.js``) 
and that file will be read instead. 

``settings-local.js`` is not version-controlled; feel free to edit it to your
heart's content.
