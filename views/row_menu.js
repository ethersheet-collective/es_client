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

var RowMenuView = module.exports = View.extend({

  events: {
    'click .es-menu-button': 'onButtonClick'
  },

  initialize: function(o){
    this.models = new RefBinder(this);
    this.data = o.data;
    this.row_id = o.row_id;
    this.setSheets(o.data.sheets || null);
    this.setUser(o.data.users.getCurrentUser());
    var current_sheet_id = this.getUser().getCurrentSheetId();
    this.setSheet(o.data.sheets.get(current_sheet_id) || null);
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

  getSheets: function(){
    return this.models.get('sheets');
  },

  setSheets: function(sheets){
    this.models.set('sheets', sheets);
  },

  getUser: function(){
    return this.models.get('user');
  },

  setUser: function(user){
    this.models.set('user', user, {
      'change_current_sheet_id': 'onChangeCurrentSheetID',
    });
  },

  render: function(){
    this.$el.empty();
    this.$el.html(t.row_menu());
  },

  getCurrentColId: function(){

  },

  getCurrentCell: function(){
    var cells =this.getSelection().getCells();
    if(!cells) return;
    return cells[0];
  },
  
  onChangeCurrentSheetID: function(){
    var sheet = this.getSheets().get(this.getUser().getCurrentSheetId());
    this.setSheet(sheet);
  },

  onButtonClick: function(e){
    console.log("CLICK")
    var action = $(e.currentTarget).data('action');
    switch(action){
      case 'add_row':
        this.addRow();
        break;
      case 'remove_row':
        this.deleteRow();
        break;
    };
  },

  addRow:function(){
    var row_position = this.getSheet().indexForRow(this.row_id); 
    if(row_position == -1) return;
    this.getSheet().insertRow(row_position);
  },

  deleteRow:function(){
    this.getSheet().deleteRow(this.row_id);
  }
});

});
