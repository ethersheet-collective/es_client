if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require){

/*
    TableView
*/
var $ = require('jquery');
var Backbone = require('backbone');
var t = require('es_client/templates');

return Backbone.View.extend({
  events: {
    'click .es-table-cell': 'selectCell'
  },
  initialize: function(o){
    this.setSheet(o.sheet || null);
    this.setSelections(o.selections || null);
    this.num_row = this.sheet.rowCount();
    this.num_col = this.sheet.colCount();
  },
  setSheet: function(sheet){
    this.unsetSheet();
    sheet.on('update_cell',this.render,this);
    sheet.on('insert_col',this.render,this);
    sheet.on('delete_col',this.render,this);
    sheet.on('insert_row',this.render,this);
    sheet.on('delete_row',this.render,this);
    this.sheet = sheet;
  },
  unsetSheet: function(){
    if(!this.sheet) return;
    this.sheet.off(null,null,this);
    this.sheet = undefined;
  },
  setSelections: function(selections){
    this.unsetSelections();
    this.selections = selections;
  },
  unsetSelections: function(){
    if(!this.selections) return;
    this.selections.off(null,null,this);
    this.selections = undefined;
  },
  initializeElements: function(){
    this.$table = $('#data-table-'+this.getId(),$el);
    this.$table_col_headers = $('#column-headers-'+this.getId(),$el);
    this.$table_row_headers = $('#row-headers-'+this.getId(),$el);
  },
  getId: function(){
    return this.sheet.cid;
  },
  render: function(){
    
    this._$el = $('<div>');
    
    var $el = this._$el;

    $el.html(t.sheet_table({id:this.getId()}));

    $('#data-table-'+this.getId(),$el)
      .html(t.table({sheet:this.sheet}));
    $('#column-headers-'+this.getId(),$el)
      .html(t.table_col_headers({num_col:this.num_col}));
    $('#row-headers-'+this.getId(),$el)
      .html(t.table_row_headers({num_row:this.num_row}));

    this.swapElement();
    
    return this;
  },
  swapElement: function(){
    this.$el.html(this._$el);
  },
  selectCell: function(e){
    var s = this.selections.getLocal();
    var data = $(e.currentTarget).data();
    console.log(data);
    s.clear();
    s.addCell(this.sheet,data.row_id,data.col_id);
  },
  destroy: function(){
    this.remove();
    this.unsetSheet();
  }
});

});
