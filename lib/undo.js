if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module) {

var UndoStack = module.exports = function(){
  this.back = new Array();
  this.cursor = 0;
};

UndoStack.prototype.push = function(do_cmd,undo_cmd) {
  this.back = this.back.slice(0,this.cursor);
  this.back.push([do_cmd,undo_cmd]);
  this.cursor++;
};

UndoStack.prototype.current = function() {
  if(this.cursor > 0) 
    return this.back[this.cursor-1];
  else 
    return [];
}

UndoStack.prototype.do = function() {
  if(this.cursor < this.back.length){
    this.cursor++;
    var current = this.current();
    return current[0];
  }
};

UndoStack.prototype.undo = function() {
  if(this.cursor > 0){
    var current = this.current();
    this.cursor--;
    return current[1];
  }
};

UndoStack.prototype.count = function() {
  return this.back.length;
};

});