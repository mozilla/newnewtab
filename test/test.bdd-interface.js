// an example to how to use BDD (scrapbook for zalun - will be removed
// soon)

var express = require('express');
var assert = require('assert');

describe('BDDInterface', function(){
  var some = {};

  describe('.assert', function() {
  
    beforeEach(function(){
      some.number = 1;
    });
  
    it('should equal', function(){
      assert(1 == some.number);
    });

    it('should not equal', function(){
      assert(2 != some.number);
    });

  });
});
