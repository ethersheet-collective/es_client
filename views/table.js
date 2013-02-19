if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){

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

var Table = module.exports = View.extend({

  events: {
    'click .es-table-cell': 'cellClicked',
    'change .es-table-cell-input': 'changeCell'
  },

  initialize: function(o){
    this.models = new RefBinder(this);
    this.setSheet(o.sheet || null);
    this.setSelections(o.selections || null);
  },

  setSheet: function(sheet){
    this.models.set('sheet',sheet,{
      'update_cell': 'onUpdateCell',
      'insert_col': 'render',
      'delete_col': 'render',
      'insert_row': 'render',
      'delete_row': 'render'
    });
  },

  setSelections: function(selections){
    this.models.set('selections',selections,{
      'add_cell': 'onAddCell',
      'clear': 'onClear'
    }); 
  },

  paintCell: function(cell){
    var $cell = $('#'+cell.row_id+'-'+cell.col_id, this.el);
    $cell.css('background-color', cell.color);
  },
    
  onAddCell: function(cell){
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

  cellClicked: function(e){
    this.removeCellInputs();
    this.selectCell(e);
    this.createCellInput(e);
  },

  removeCellInputs: function(){
    $('.es-table-cell-input').remove();
  },

  selectCell: function(e){
    var s = this.getSelections().getLocal();
    var data = $(e.currentTarget).data();
    s.clear();
    s.addCell(this.getSheet().id,data.row_id,data.col_id);
  },

  createCellInput: function(e){
    var $el = $(e.currentTarget);
    var x = $el.offset().left;
    var y = $el.offset().top;
    var width = $el.width();
    var height = $el.height() - 2;
    var color = "#ffaa99";
    var row_id = $el.data().row_id;
    var col_id = $el.data().col_id;

    var $input = $("<input id='"+$el.attr('id')+"-input' data-row_id='"+row_id+"' data-col_id='"+col_id+"' class='es-table-cell-input' value='"+$el.attr('data-value')+"' style='left: "+x+"px; top: "+y+"px; width: "+width+"px; height: "+height+"px; background-color: "+color+";' />");
    
    this.$el.append($input);
    $input.focus();
    var self = this;
    var timer = null;
    $input.on('keyup', function(){
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(function(){
        self.getSheet().updateCell(row_id, col_id, $input.val()); 
      }, 500);
    });
  },

  changeCell: function(e){
    var $el = $(e.currentTarget);
    var data = $el.data();
    this.getSheet().commitCell(data.row_id, data.col_id, $el.val());
  },

  onUpdateCell: function(cell){
    var $el = $('#'+cell.row_id+'-'+cell.col_id);
    $el.text(cell.display_value);
    $el.attr('data-value', cell.value);
  },  

  destroy: function(){
    this.remove();
    this.models.unsetAll();
  }
});

});
