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
var t = require('es_client/templates');
var RefBinder = require('ref-binder');
var View = require('backbone').View;
var _ = require('underscore');

var MenuView = module.exports = View.extend({

  events: {
    'click .es-menu-button': 'onButtonClick'
  },

  initialize: function(o){
    this.models = new RefBinder(this);
    this.setSheet(o.sheet || null);
    this.setSelection(o.selections.getLocal() || null);
  },

  getSheet: function(){
    return this.models.get('sheet');
  },

  setSheet: function(sheet){
    this.models.set('sheet',sheet);
  },

  getSelection: function(){
    return this.models.get('selection');
  },

  setSelection: function(selection){
    this.models.set('selection',selection); 
  },

  render: function(){
    this.$el.empty();
    this.$el.html(t.menu());
  },

  getCurrentCell: function(){
    var cells =this.getSelection().getCells();
    if(!cells) return;
    return cells[0];
  },

  onButtonClick: function(e){
    var cell = this.getCurrentCell();
    var action = $(e.currentTarget).data('action');
    switch(action){
      case 'add_column':
        this.addCol(cell.col_id);
        break;
      case 'remove_column':
        this.deleteCol(cell.col_id);
        break;
      case 'add_row':
        this.addRow(cell.row_id);
        break;
      case 'remove_row':
        this.deleteRow(cell.row_id);
        break;
    };
  },

  addRow:function(row_id){
    var row_position = this.getSheet().indexForRow(row_id); 
    if(row_position == -1) return;
    this.getSheet().insertRow(row_position);
  },

  deleteRow:function(row_id){
    this.getSheet().deleteRow(row_id);
  },

  addCol:function(col_id){
    var col_position = this.getSheet().indexForCol(col_id); 
    if(col_position == -1) return;
    this.getSheet().insertRow(col_position);
  },

  deleteCol:function(col_id){
    this.getSheet().deleteCol(col_id);
  },
});

});
