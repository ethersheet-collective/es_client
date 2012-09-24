if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require){

/*

  #TableView

  An interactive table interface for a single sheet.

  ## References
  * Sheet
  * SelectionCollection

*/

var $ = require('jquery');
var t = require('es_client/templates');
var RefBinder = require('ref-binder');
var View = require('backbone').View;

return View.extend({

  events: {
    'click .es-table-cell': 'selectCell'
  },

  initialize: function(o){
    this.ref = new RefBinder(this);
    this.setSheet(o.sheet || null);
    this.setSelections(o.selections || null);
  },

  setSheet: function(sheet){
    this.ref.set('sheet',sheet,{
      'update_cell': 'render',
      'insert_col': 'render',
      'delete_col': 'render',
      'insert_row': 'render',
      'delete_row': 'render'
    });
  },

  getSheet: function(){
    return this.ref.get('sheet');
  },

  setSelections: function(selections){
    this.selections = selections;
  },

  getSelections: function(){
    return this.selections;
  },

  initializeElements: function(){
    this.$table = $('#data-table-'+this.getId(),$el);
    this.$table_col_headers = $('#column-headers-'+this.getId(),$el);
    this.$table_row_headers = $('#row-headers-'+this.getId(),$el);
  },

  getId: function(){
    return this.getSheet().cid;
  },

  render: function(){

    var $el = this._$el = $('<div>');

    $el.html(t.sheet_table({id:this.getId()}));

    $('#data-table-'+this.getId(),$el)
      .html(t.table({sheet:this.getSheet()}));
    $('#column-headers-'+this.getId(),$el)
      .html(t.table_col_headers({num_col:this.getSheet().colCount()}));
    $('#row-headers-'+this.getId(),$el)
      .html(t.table_row_headers({num_row:this.getSheet().rowCount()}));

    this.swapElement();

    return this;
  },

  swapElement: function(){
    this.$el.html(this._$el);
  },

  selectCell: function(e){
    var s = this.getSelections().getLocal();
    var data = $(e.currentTarget).data();
    s.clear();
    s.addCell(this.getSheet(),data.row_id,data.col_id);
  },

  destroy: function(){
    this.remove();
    this.ref.unsetAll();
  }
});

});
