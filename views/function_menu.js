if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){

/*

  #MenuView

  A list of available actions, given the current context. 

  ## References
  * Sheet
  * SelectionCollection

*/

var $ = require('jquery');
var t = require('../templates');
var RefBinder = require('ref-binder');
//var View = require('backbone').View;
var MenuView = require('./menu');
var ExpressionHelpers = require('../lib/expression_helpers');
var _ = require('underscore');

var FunctionMenuView = module.exports = MenuView.extend({

  events: {
    'click .es-menu-button': 'onButtonClick'
  },

  render: function(){
    var eh = ExpressionHelpers(this.data);
    this.$el.empty();
    this.$el.html(t.function_menu({eh:eh}));
  },

  getCurrentCell: function(){
    var cells =this.getSelection().getCells();
    if(!cells) return;
    return cells[0];
  },

  onButtonClick: function(e){
    var action = "=" + $(e.currentTarget).data('action');
    var cell = this.getCurrentCell();
    var sheet = this.getSheet();
    sheet.updateCell(cell.row_id, cell.col_id, action);
    var input_selector = "#" + cell.row_id + '-' + cell.col_id + '-input';
    $(input_selector).focus();
  },

    
});

});
