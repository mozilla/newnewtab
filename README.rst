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

Settings
########

By default, settings are in ``config-default.js``. You can override settings 
in there with environment variables (``PORT`` will override ``express:port``), 
but if you want to customize lots of settings locally (either for 
development or deployment), you can create ``config-local.json`` and that file 
will augment or add to settings read by default. 

``config-local.json`` is not version-controlled; feel free to edit it to your
heart's content.

Fetching recommendations
========================

Use ``node script/fetch_recommendations``.
