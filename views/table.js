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
var _ = require('underscore');

return View.extend({

  events: {
    'click .es-table-cell': 'selectCell'
  },

  initialize: function(o){
    this.models = new RefBinder(this);
    this.setSheet(o.sheet || null);
  },

  setSheet: function(sheet){
    this.models.set('sheet',sheet,{
      'update_cell': 'render',
      'insert_col': 'render',
      'delete_col': 'render',
      'insert_row': 'render',
      'delete_row': 'render'
    });
    this.models.set('selections',sheet.getSelections(),{
      'add_cell': 'onAddCell',
      'clear': 'onClear'
    }); 
  },

  paintCell: function(cell){
    var el = document.getElementById(cell.row_id+':'+cell.col_id);
    el.style.backgroundColor = cell.color;
  },
    
  onAddCell: function(cell){
    cell.color = '#ffaa99';
    this.paintCell(cell);
  },

  onClear: function(cells){
    var table = this;
    _.each(cells, function(cell){
      cell.color = '#ffffff';
      table.paintCell(cell);
    });
  },

  getSheet: function(){
    return this.models.get('sheet');
  },

  getSelections: function(){
    return this.models.get('selections');
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
    this.models.unsetAll();
  }
});

});
