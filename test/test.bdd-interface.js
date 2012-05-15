var express = require('express')
  , assert = require('assert');

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
