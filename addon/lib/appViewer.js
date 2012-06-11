/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";
const {Ci,Cu} = require("chrome");
const {makeWindowHelpers} = require("makeWindowHelpers");
const {unload} = require("unload+");
const {watchWindows} = require("watchWindows");
const {trace} = require("dumper");
const {listen} = require("listen");
const {data} = require("self");
const file = require("file");
const {XMLHttpRequest} = require("xhr");
const timers = require("timers");
const simplePrefs = require("simple-prefs");

Cu.import("resource://gre/modules/Services.jsm", this);
const XHTML_NS = "http://www.w3.org/1999/xhtml";
const CATEGORY_RESULTS = {
Arts: 0.9,
Business: 0.8,
Computers: 0.6,
Games: 0.7,
Health: 0.8,
Home: 0.9,
News: 0.7,
Recreation: 0.2,
Reference: 0.1,
Regional: 0.2,
Science: 0.1,
Shopping: 0.2,
Society: 0.1
};

const DEMOGRAPHICS_RESULTS = {
age_18: 0.2,
age_25: 0.3,
age_35: 0.7,
age_45: 0.9,
age_55: 0.3,
age_65: 0.1,
no_college: 0.1,
some_college: 0.3,
college: 0.1,
graduate: 0.4,
male: 0.1,
female: 0.5,
children: 0.5,
no_children: 0.1,
home: 0.2,
school: 0.1,
work: 0.8
}

function AppViewer( configObject ) {
try{
    this._window = configObject.window;
	this._document = configObject.document;
	this._backGroundElement = configObject.bElement;
    //let {change, createNode, listen, unload} = makeWindowHelpers(this._window);
	let div  = this._document.getElementById( "newtab-vertical-margin");

	let iframe = this._document.createElementNS(XHTML_NS, "iframe");
	iframe.setAttribute( "type" , "content" );
    iframe.style.left = "-1000px";
    iframe.style.top = "36px";
    iframe.style.width = "85%";
    iframe.style.height = "90%";
	iframe.style.position = "absolute";
	iframe.style.background = "white";

    iframe.style.boxShadow = "5px 5px 10px black";
    iframe.style.borderRadius = "10px 10px 10px 10px";

	//iframe.style.MozTransitionProperty = "left";
	//iframe.style.MozTransitionDuration = "2s";

	// remove the border pixels
	iframe.style.borderWidth = "0px";
	iframe.style.borderLeftWidth = "0px";
	iframe.style.borderRightWidth = "0px";
	iframe.style.borderTopWidth = "0px";
	iframe.style.borderBottomWidth = "0px";

	// now that we have iframe, let's install apis into it
    var apiInjector = function(doc, topic, data) {
	try {
		// make sure that it's our iframe document that has been inserted into iframe
		if( !doc.defaultView || doc.defaultView != iframe.contentWindow) {
		          return;  // so it was not
	    }
		console.log( "caught document insertion" );
		Services.obs.removeObserver(apiInjector, 'document-element-inserted', false);

		iframe.contentWindow.wrappedJSObject.getCategories = function( callback ) {   
			callback( CATEGORY_RESULTS );
		}

		iframe.contentWindow.wrappedJSObject.getDemographics = function( callback ) {   
			callback( DEMOGRAPHICS_RESULTS );
		}
	  } catch (ex) {  console.log( "ERROR " + ex ); }
	};
	Services.obs.addObserver( apiInjector , 'document-element-inserted', false);

	//iframe.src = "https://myapps.mozillalabs.com";
	iframe.src = (simplePrefs.prefs.apps_page_url || data.url( "newtab_test.html" ));
	//iframe.src = data.url( "newtab_test.html" );
	// insert doc into the thing
	div.parentNode.insertBefore(iframe, div.nextSibling)

	// move left to clientWidth
	iframe.style.left =  "-" + iframe.clientWidth + "px";
	this._iframe = iframe;
	this._shown = false;

	var self = this;
    iframe.onload = function ( event ) {
		console.log( "loaded" );
		iframe.contentWindow.addEventListener("click", function( event ) {
	        console.log("iframe clicked");
			if( self._shown == false ) {
				self.show( );
			}
	   });
	   self.hide( );
	};

	iframe.contentWindow.onresize = function ( event ) {
		self.resize( );
	};

    /*** this is no loger needed, since we have buttons coltrooling hide/show 
	//
	this._backGroundElement.addEventListener("click", function(event) {
	        console.log( "CLICKED DIV" );
			if( self._shown == true ) {
				self.hide( );
			}
      } );
	 ****/

} catch ( ex ) {

    console.log( "ERROR" + ex );

}
}



AppViewer.prototype = {
    show: function () {
	try {
		let baseWidth = this._backGroundElement.clientWidth;
		let leftExtent = ( baseWidth - this._iframe.clientWidth ) / 2;
		this._shown = true;
		//this._iframe.style.visibility = "visible";
		this._iframe.style.MozTransitionProperty = "left";
		this._iframe.style.MozTransitionDuration = "1s";
		this._iframe.style.left = leftExtent + "px";
		this._backGroundElement.style.opacity = "0.5";
		} catch( ex ) { console.log( "ERROR" + ex ); }
    } ,

    hide: function () {
	try {
		//let baseWidth = this._backGroundElement.clientWidth;
		let leftExtent = this._iframe.clientWidth + 10;
		this._iframe.style.left = "-" + leftExtent + "px";

		this._window.setTimeout(  function( ) {
			this._iframe.style.MozTransitionProperty = "";
			this._iframe.style.MozTransitionDuration = "";
			this._backGroundElement.style.opacity = "";
			//this._iframe.style.visibility = "hidden";
			this._shown = false;
		}.bind( this ) , 1000 );
		} catch( ex ) { console.log( "ERROR" + ex ); }
    } ,

	resize: function( ) {
	    console.log( "in resize" );
		if( this._shown == true ) return;
		let leftExtent = this._iframe.clientWidth - 40;
        this._iframe.style.left = "-" + leftExtent + "px";
	},
}

exports.AppViewer = AppViewer;
