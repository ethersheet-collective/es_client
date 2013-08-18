if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var assert = require('chai').assert;
var EventTrap = require('../event_trap');
var connect = require('es_client/lib/share_db').connect;
var disconnect = require('es_client/lib/share_db').disconnect;

describe('SheetCollection', function(){
  var sheets, data, event_trap;


  beforeEach(function(done){
    var o = {
      channel:'create_data_test',
    };
    connect(o,function(err,test_data){
      data = test_data;
      event_trap = new EventTrap();
      data.sheets.on('all', event_trap.eventHandler);
      done();
    });
  });

  afterEach(function(done){
    disconnect(data,function(err){
      done(err);
    });
  });

  describe('adding a x  sheet', function(){

    it('should increase the number of sheets', function(){
      assert.equal(data.sheets.length, 1);
      data.sheets.addSheet();
      assert.equal(data.sheets.length, 2);
    });
    
    it('should create a sheet with the correct data', function(){
      data.sheets.addSheet({id:'foobar'});
      assert.equal(data.sheets.at(1).id, 'foobar');
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
