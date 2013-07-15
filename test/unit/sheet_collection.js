if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var assert = require('chai').assert;
var EventTrap = require('../event_trap');
var config = require('es_client/config');
var getData = require('es_client/test/fixtures');

describe('SheetCollection', function(){
  var sheets, data, event_trap;
  var initializeCollection = function(o){
    var o = o || {};
    data = getData(o);
  };


  beforeEach(function(){
    initializeCollection();
    event_trap = new EventTrap();
    data.sheets.on('all', event_trap.eventHandler);
  });

  describe('adding a sheet', function(){

    it('should increase the number of sheets', function(){
      assert.equal(data.sheets.length, 1);
      data.sheets.addSheet();
      assert.equal(data.sheets.length, 2);
    });
    
    it('should trigger two events', function(){
      data.sheets.addSheet();
      assert.equal(event_trap.events.length, 2);
    });

    it('should trigger an add event',function(){
      data.sheets.addSheet();
      assert.equal(event_trap.events[0].name, 'add');
    });

    it('should trigger a send event', function(){
      data.sheets.addSheet();
      assert.equal(event_trap.events[1].name, 'send');
    });

  });
});

});
