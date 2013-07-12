if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){

/*

  #HistoryView

  A list of changes that have been made to a sheet. 

  ## References
  * Sheet
  * SelectionCollection

*/

var $ = require('jquery');
var t = require('../templates');
var View = require('backbone').View;
var _ = require('underscore');

var HistoryView = module.exports = View.extend({

  initialize: function(o){
    this.data = o.data
    this.undo_stack = o.data.undo_stack;
    this.undo_stack.on('change',this.render.bind(this));
  },

  render: function(){
    var $list = $("<ul>");
    
    this.$el.empty();

    this.undo_stack
    .getCollection()
    .forEach(function(command){
      $list.prepend("<li>"+command[0].action+"</li>");
    });
    this.$el.append($list);
  }

  
});

});
