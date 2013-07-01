if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module) {

var Events = require('backbone').Events;
var _ = require('underscore');

var UndoStack = module.exports = function(){
  this.stack = new Array();
  this.cursor = 0;
};

_.extend(UndoStack.prototype, Events);

UndoStack.prototype.push = function(do_cmd,undo_cmd) {
  this.stack = this.stack.slice(0,this.cursor);
  this.stack.push([do_cmd,undo_cmd]);
  this.cursor++;
  this.trigger('change');
};

UndoStack.prototype.current = function() {
  if(this.cursor > 0) 
    return this.stack[this.cursor-1];
  else 
    return [];
}

UndoStack.prototype.do = function() {
  if(this.cursor < this.stack.length){
    this.cursor++;
    var current = this.current();
    this.trigger('change');
    return current[0];
  }
};

UndoStack.prototype.undo = function() {
  if(this.cursor > 0){
    var current = this.current();
    this.cursor--;
    this.trigger('change');
    return current[1];
  }
};

UndoStack.prototype.count = function() {
  return this.stack.length;
};

UndoStack.prototype.getCollection = function() {
  return this.stack.slice(0,this.cursor);
};

});