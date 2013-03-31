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
    'change .es-table-cell-input': 'changeCell',
    'keypress .es-table-cell-input': 'inputKeypress'
  },

  initialize: function(o){
    this.models = new RefBinder(this);
    this.setSheet(o.sheet || null);
    this.setSelections(o.selections || null);
  },

  setSheet: function(sheet){
    this.models.set('sheet',sheet,{
      'update_cell': 'onUpdateCell',
      'commit_cell': 'onCommitCell',
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
    this.$table = $('#es-table-'+this.getId(),this.$el);
    this.$grid = $('#es-grid-container-'+this.getId(),this.$el);
    this.$table_col_headers = $('#es-column-headers-'+this.getId(),this.$el);
    this.$table_row_headers = $('#es-row-headers-'+this.getId(),this.$el);
  },

  getId: function(){
    return this.getSheet().cid;
  },

  render: function(){

    var $el = this._$el = $('<div>');

    $el.append(t.sheet_table({id:this.getId()}));

    $('#es-data-table-'+this.getId(),$el)
      .html(t.table({sheet:this.getSheet()}));
    $('#es-column-headers-'+this.getId(),$el)
      .html(t.table_col_headers({num_col:this.getSheet().colCount()}));
    $('#es-row-headers-'+this.getId(),$el)
      .html(t.table_row_headers({num_row:this.getSheet().rowCount()}));

    this.swapElement();
    this.initializeElements();
    this.initializeScrolling();
    return this;
  },

  initializeScrolling: function(){
    var view = this;
    var grid_el = this.$grid[0];
    this.$grid.scroll(function(e){
      view.$table_col_headers.css('left',(0-grid_el.scrollLeft)+"px");
      view.$table_row_headers.css('top',(0-grid_el.scrollTop)+"px");
    });
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
    s.addCell(this.getSheet().id,data.row_id.toString(),data.col_id.toString());
  },

  createCellInput: function(e){
    var s = this.getSelections().getLocal();
    var $el = $(e.currentTarget);
    var x = $el.offset().left;
    var y = $el.offset().top;
    var width = $el.width();
    var height = $el.height() - 2;
    var color = s.getColor();
    var row_id = $el.data().row_id.toString();
    var col_id = $el.data().col_id.toString();
    var cell_value = this.getSheet().getDisplayFormula(row_id,col_id);
    

    var $input = $("<input id='"+$el.attr('id')+"-input' data-row_id='"+row_id+"' data-col_id='"+col_id+"' class='es-table-cell-input' value='"+cell_value+"' style='left: "+x+"px; top: "+y+"px; width: "+width+"px; height: "+height+"px; background-color: "+color+";' />");
    
    this.$el.append($input);
    $input.focus();
    var timer = null;
    var sheet = this.getSheet();
    $input.on('keyup', function(){
      this.old_val = this.old_val || '';
      if($input.val() != this.old_val){
        sheet.updateCell(row_id, col_id, $input.val(), $el.text()); 
        this.old_val = $input.val() || this.old_val;
      }
    });
    return $input;
  },

  changeCell: function(e){
    var $el = $(e.currentTarget);
    var data = $el.data();
    this.getSheet().commitCell(data.row_id.toString(), data.col_id.toString(), $el.val());
  },

  inputKeypress: function(e){
    var code = (e.keyCode ? e.keyCode : e.which);
    //return unless code is 'enter' or 'tab' 
    if(code != 13 && code != 9) return;
    if(code == 13){
      this.moveCell(e,1,0);
    }
    if(code == 9){
      this.moveCell(e,0,1);
    }
  },

  moveCell: function(e, row_offset, col_offset){
    this.changeCell(e);
    var old_cell = $(e.currentTarget);
    var rows = this.getSheet().rows;
    var cols = this.getSheet().cols;
    var new_col_idx = _.indexOf(cols,old_cell.attr('data-col_id')) + col_offset;
    var new_col = cols[new_col_idx];
    var new_row_idx = _.indexOf(rows,old_cell.attr('data-row_id')) + row_offset;
    var new_row = rows[new_row_idx];
    var new_cell = $('#' + new_row + '-' + new_col);
    this.cellClicked({currentTarget: new_cell});
  },

  onUpdateCell: function(cell){
    var $el = $('#'+cell.row_id+'-'+cell.col_id);
    $el.text(cell.cell_display);
  },  

  onCommitCell: function(cell){
    this.onUpdateCell(cell);
  },  

  destroy: function(){
    this.remove();
    this.models.unsetAll();
  }
});

});
