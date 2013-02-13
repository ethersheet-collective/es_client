if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var assert = require('chai').assert;
var EventTrap = require('es_client/test/event_trap');
var Ethersheet = require('es_client/ethersheet');
var $ = require('jquery');

var $container = $('<div id="ethersheet-container" style="display:none;"></div').appendTo('body');

describe('Ethersheet Client', function(){
  var es, user_trap;

  beforeEach(function(done){
    $container.empty();
    user_trap = new EventTrap();
    es = new Ethersheet({
      target:'#ethersheet-container',
      channel:'test_channel',
      user:{
        id: 'test_user'
      }
    });
    es.data.user.on('all',user_trap.eventHandler);
    es.onConnect(done);
  });

  afterEach(function(){
    $container.empty();
    user_trap.clearEvents(); 
  });

  describe('on initialization', function(){
    it('sends addUser event',function(){
      var expected_event = {
        name:'send',
        args:[{
          type:'user',
          action:'addUser',
          params:[{
            id:'test_user' 
          }]
        }]
      };
      assert.equal(user_trap.events.length,2);
      assert.deepEqual(user_trap.events[1],expected_event);
    });
  });
});

});
