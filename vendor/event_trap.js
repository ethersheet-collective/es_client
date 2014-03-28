if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

var EventTrap = module.exports = function(){
  this.events = [];
  this.eventHandler = this.eventHandler.bind(this);
};

EventTrap.prototype.eventHandler = function(){
  this.events.push({
    name: arguments[0],
    args: Array.prototype.slice.call(arguments,1)
  });
};

EventTrap.prototype.clearEvents = function(){
  this.events = [];
};

});
