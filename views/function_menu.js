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
//var MenuView = require('./menu');
var ExpressionHelpers = require('../lib/expression_helpers');
var _ = require('underscore');

var FunctionMenuView = module.exports = View.extend({

  events: {
    'click .es-menu-button': 'onButtonClick'
  },

  initialize: function(o){
    this.models = new RefBinder(this);
    this.data = o.data;
    this.setSheets(o.data.sheets || null);
    this.setUser(o.data.users.getCurrentUser());
    var current_sheet_id = this.getUser().getCurrentSheetId();
    this.setSheet(o.data.sheets.get(current_sheet_id) || null);
    this.setSelection(o.data.selections.getLocal() || null);
  },

 getSelection: function(){
   return this.models.get('selection');
 },

 setSelection: function(selection){
   this.models.set('selection',selection);
 },

  getSheet: function(){
    return this.models.get('sheet');
  },

  setSheet: function(sheet){
    this.models.set('sheet',sheet);
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
