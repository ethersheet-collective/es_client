if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){

/*

  #Keyboard

*/

var $ = require('jquery');
var Backbone = require('backbone');
var Events = Backbone.Events;
var _ = require('underscore');

var KeyboardInput =  {};

_.extend(KeyboardInput,Events);


// ##keypress

$(document).bind('keypress',function(e) {
  console.log('e',e);
  var event_name = String(e.which);
  if($(e.target).is("input")) return;

  console.log('keypress',event_name,e.target);
  if(KeyboardInput._callbacks[event_name]){
    KeyboardInput.trigger(event_name,e);
    return false;
  }
});

// ##keydown

$(document).bind('keydown',function(e) {
  var event_name = String(e.which);
  if(e.metaKey) event_name = 'meta_' + event_name;
  if(e.shiftKey) event_name = 'shift_' + event_name;

  if(KeyboardInput._callbacks[event_name]){
    KeyboardInput.trigger(event_name,e);
    return false;
  }
});

module.exports = function createKeyboardInput(){
  return KeyboardInput;
};

});