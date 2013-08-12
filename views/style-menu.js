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
var View = require('backbone').View;
var _ = require('underscore');

var MenuView = module.exports = View.extend({

  events: {
    'click .es-menu-button': 'onButtonClick'
  },

  initialize: function(o){
    this.models = new RefBinder(this);
    this.data = o.data;
    this.setSheet(o.data.sheets.first() || null);
    this.setSelection(o.data.selections.getLocal() || null);
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
    var action = $(e.currentTarget).data('action');
    switch(action){
      case 'add_column':
        this.addCol();
        break;
      case 'remove_column':
        this.deleteCol();
        break;
      case 'add_row':
        this.addRow();
        break;
      case 'remove_row':
        this.deleteRow();
        break;
      case 'sort_rows':
        this.sortRows();
        break;
      case 'format_cell':
        this.formatCell();
        break;
      case 'import_csv':
        this.importCSV();
        break;
    };
  },

  addRow:function(){
    var row_id = this.getCurrentCell().row_id;
    var row_position = this.getSheet().indexForRow(row_id); 
    if(row_position == -1) return;
    this.getSheet().insertRow(row_position);
  },

  deleteRow:function(){
    var row_id = this.getCurrentCell().row_id;
    this.getSheet().deleteRow(row_id);
  },

  sortRows:function(){
    var col_id = this.getCurrentCell().col_id;
    this.getSheet().sortRows(col_id);
  },

  formatCell:function(){
    var cell = this.getCurrentCell();
    var selection = this.getSelection();
    $('#es-modal-box').html(t.cell_format_dialog({selection: selection}));
    $('#es-modal-overlay').show();
    $('.es-format-toggle').click(function(){
      var format_string = $(this)[0].id;
      selection.addFormat(format_string);
    });
  },

  addCol:function(){
    var col_id = this.getCurrentCell().col_id;
    var col_position = this.getSheet().indexForCol(col_id); 
    if(col_position == -1) return;
    this.getSheet().insertCol(col_position);
  },

  deleteCol:function(){
    var col_id = this.getCurrentCell().col_id;
    this.getSheet().deleteCol(col_id);
  },

  importCSV:function(){
    $('#es-modal-box').html(t.import_dialog({sheet_id: this.getSheet().id}));
    $('#es-modal-overlay').show();
  }
  
});

});
