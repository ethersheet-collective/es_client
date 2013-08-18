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
var t = require('../templates');
var RefBinder = require('ref-binder');
var View = require('backbone').View;
var _ = require('underscore');
var h = require('es_client/helpers');

var MIN_CELL_WIDTH = 22;
var MIN_CELL_HEIGHT = 22;

var Table = module.exports = View.extend({


// ## DOM BINDING

  events: {
    'mousedown .es-table-cell': 'cellMouseDown',
    'mousemove .es-table-cell': 'cellMouseMove',
    'mouseup .es-table-cell': 'cellMouseUp',
    'click .es-table-cell': 'cellClicked',
    'click .es-row-header': 'selectRow',
    'click .es-column-header': 'selectCol',
    'change .es-table-cell-input': 'changeCell',
    'keydown': 'inputKeypress'
  },


// ## LIFECYCLE

  initialize: function(o){
    this.is_rendered = false;
    this.models = new RefBinder(this);
    this.draggedCell = null;
    this.draggingRow = false;
    this.draggingCol = false;
    this.data = o.data;
    this.setCurrentUser(o.data.users.getCurrentUser() || null);
    var current_sheet_id = this.getCurrentUser().getCurrentSheetId();
    this.setSheet(o.data.sheets.get(current_sheet_id) || null);
    this.setSheets(o.data.sheets || null);
    this.setSelections(o.data.selections || null);
    this.setLocalSelection(o.data.selections.getLocal() || null);
    _.defer(function(caller){
      caller.onRefreshCells(); 
    }, this);
    this.$grid = null;
    $(window).resize(this.resize.bind(this));
  },

  destroy: function(){
    this.remove();
    this.models.unsetAll();
    this.models = null;
  },


// ## MODEL SETTERS

  setSheet: function(sheet){
    this.models.set('sheet',sheet,{
      'update_cell': 'onUpdateCell',
      'commit_cell': 'onCommitCell',
      'resize_cell': 'resizeCell',
      'insert_col': 'render',
      'delete_col': 'render',
      'insert_row': 'render',
      'delete_row': 'render',
      'sort_rows':  'render', 
      'refresh_cells': 'onRefreshCells',
      'add_format_to_cell': 'updateCellClass'
    });
  },
  setSheets: function(sheets){
    this.models.set('sheets',sheets,{});
  },
  updateCellClass: function(row_id,col_id, cls){
    var $cell = $('#'+row_id+'-'+col_id, this.el);
    $cell.addClass(cls);
  },
  onRefreshCells: function(){
    var sheet = this.getSheet();
    $('.es-usd').each(function(idx, el){
      $el = $(el);
      var cell = sheet.getCell($el.data('row_id'), $el.data('col_id'));
      if(cell.type != 'number'){ return; }
      var cell_display = sheet.getCellDisplay(cell);
      $el.text('$' + parseFloat(cell_display).toFixed(2));
    });
  },
  setSelections: function(selections){
    this.models.set('selections',selections,{
      'add_cell': 'onRemoteAddCell',
      'select_row': 'onRemoteAddCells',
      'select_col': 'onRemoteAddCells',
      'clear': 'onClear'
    }); 
  },

  setCurrentUser: function(current_user){
    this.models.set('current_user', current_user, {
      'change_current_sheet_id': 'onChangeCurrentSheetId'
    });  
  },

  setLocalSelection: function(local_selection){
    this.models.set('local_selection',local_selection,{
      'add_cell': 'onLocalAddCell',
      'select_row': 'onLocalAddCells',
      'select_col': 'onLocalAddCells',
      'clear': 'onClear'
    });
  },


// ## MODEL GETTERS

  getSheet: function(){
    return this.models.get('sheet');
  },
  
  getSheets: function(){
    return this.models.get('sheets');
  },

  getCurrentUser: function(){
    return this.models.get('current_user');
  },
  
  unpaintCell: function(cell){
    var $cell = $('#'+cell.row_id+'-'+cell.col_id, this.el);
    $cell.css('background-color', '');
  },
    
  onRemoteAddCell: function(cell){
    this.paintCell(cell);
  },

  getSelections: function(){
    return this.models.get('selections');
  },

  getLocalSelection: function(){
    return this.models.get('local_selection');
  },

  getId: function(){
    //userd to get cid
    return this.getCurrentUser().getCurrentSheetId();
  },


// ## SELECTION EVENTS
  onLocalAddCells: function(cells){
    var self = this;
    var first_cell = cells.shift();
    self.onLocalAddCell(first_cell);
    _.each(cells, function(cell){
      self.paintCell(cell);
    });
    cells.unshift(first_cell);
  },

  onLocalAddCell: function(cell){
    var $cell = $('#'+cell.row_id+'-'+cell.col_id, this.el);
    var e = {currentTarget: $cell};
     
    this.paintCell($cell);
    this.removeCellInputs();
    this.createCellInput(e);
  },

  onRemoteAddCells: function(cells){
    var self = this;
    _.each(cells, function(cell){
      self.paintCell(cell);
    });
  },

  onRemoteAddCell: function(cell){
    this.paintCell(cell);
  },

  onClear: function(cells){
    var table = this;
    _.each(cells, function(cell){
      table.unpaintCell(cell);
    });
  },


// ## SHEET EVENTS

  onUpdateCell: function(cell){
    var $el = $('#'+cell.row_id+'-'+cell.col_id);
    $el.text(cell.cell_display);
    var input =$('#' + $el.attr('id') + '-input');
    if(input.length > 0){
      input.val(cell.cell_display);
    }
    this.resizeRowHeader(cell.row_id);
  },  

  onCommitCell: function(cell){
    this.onUpdateCell(cell);
  },


// ## RENDERING

  paintCell: function(cell){
    var $cell = $('#'+cell.row_id+'-'+cell.col_id, this.el);
    $cell.css('background-color', cell.color);
  },

  render: function(){
    this.$el.empty();
    this.$el.append($(t.sheet_table({id:this.getId()})));
    
    $('#es-data-table-'+this.getId(),this.$el)
      .html(t.table({sheet:this.getSheet()}));

    this.drawRowHeaders();
    this.drawColHeaders();

    this.initializeElements();
    this.initializeScrolling();
    this.initializeSelections();
    setTimeout(this.resizeRowHeaders.bind(this),100);
    setTimeout(this.resizeRowHeaders.bind(this),300);
    setTimeout(this.resizeColHeaders.bind(this),100);
    setTimeout(this.resizeColHeaders.bind(this),300);
    this.$grid = $(".es-grid-container",this.$el);
    this.is_rendered = true;
    this.resize();
    return this;
  },

  resize: function(){
    if(!this.is_rendered) return;
    var grid_height = this.$el.innerHeight() - 18;
    var grid_width = this.$el.innerWidth() - 45;
    this.$grid.height(grid_height);
    this.$grid.width(grid_width);
  },

  initializeSelections: function(){
    this
    .getSelections()
    .each(function(selection){
      selection.redraw();
    });
  },

  initializeElements: function(){
    this.$table = $('#es-grid-'+this.getId(),this.$el);
    this.$grid = $('#es-grid-container-'+this.getId(),this.$el);
    this.$table_col_headers = $('#es-column-headers-'+this.getId(),this.$el);
    this.$table_row_headers = $('#es-row-headers-'+this.getId(),this.$el);
  },

  initializeScrolling: function(){
    var view = this;
    var grid_el = this.$grid[0];
    this.$grid.scroll(function(e){
      view.$table_col_headers.css('left',(0-grid_el.scrollLeft)+"px");
      view.$table_row_headers.css('top',(0-grid_el.scrollTop)+"px");
    });
  },


// ## ROW METHODS

  drawRowHeaders: function()
  {
    var view = this;
    var html = '';
    var row_name = '';
    var height = null;
    
    _.each(this.getSheet().rowIds(), function(row_id,index){
      row_name = index+1;
      height = view.heightForRow(row_id);
      html +='<tr id="es-header-'+row_id+'" style="height:'+height+'px;"><th class="es-row-header">'+row_name+'</th></tr>'
    });

    $('#es-row-headers-'+this.getId(),this.$el).html(html);
  },

  heightForRow: function(row_id){
    var row_el = document.getElementById(row_id);
    if(row_el){
      return row_el.offsetHeight;
    }
    return undefined;
  },

  resizeRowHeaders: function(){
    var view = this;
    _.each(this.getSheet().rowIds(), function(row_id){
      view.resizeRowHeader(row_id);
    });
  },

  resizeRowHeader: function(row_id){
    var header = document.getElementById("es-header-"+row_id);
    var height = this.heightForRow(row_id);
    if(!header || !height) return;
    header.style.height = height+"px";
  },

  resizeRow: function(row_id,height){
    var row_el = document.getElementById(row_id);
    if(!row_el || !height) return;
    if(height < MIN_CELL_HEIGHT) height = MIN_CELL_HEIGHT;
    row_el.style.height = height+"px";
  },


// ## COLUMN METHODS

  drawColHeaders: function(){
    var view = this;
    var html = '';

    var width = null;

    _.each(this.getSheet().colIds(), function(col_id,index){
      width = view.widthForCol(col_id);
      html +='<th id="es-col-header-'+col_id+'" class="es-column-header" style="width:'+width+'px;">'
              +h.columnIndexToName(index)
              +'</th>';
    });

    $('#es-column-headers-'+this.getId(),this.$el).html(html);
  },

  widthForCol: function(col_id){
    var row_id = this.getSheet().rowAt(0);
    var col_el = document.getElementById(row_id+'-'+col_id);
    if(col_el){
      return col_el.clientWidth;
    }
    return undefined;

  },

  resizeColHeaders: function(col_id){
    var view = this;
    _.each(this.getSheet().colIds(), function(col_id){
      view.resizeColHeader(col_id);
    });
  },

  resizeColHeader: function(col_id){
    var header = document.getElementById("es-col-header-"+col_id);
    var width = this.widthForCol(col_id);
    if(!header || !width) return;
    header.style.width = width+"px";
  },

  resizeCol: function(col_id,width){
    var row_id = this.getSheet().rowAt(0);
    var col_el = document.getElementById(row_id+'-'+col_id);
    if(!col_el) return;
    if(width < MIN_CELL_WIDTH) width = MIN_CELL_WIDTH;
    col_el.style.width = width+"px";
  },


// ## CELL EVENTS

  cellClicked: function(e){
    if (this.isDraggingCell()) return;
    this.selectCell(e);
  },
  
  cellMouseDown: function(e){
    this.setCellDragTarget(e);
    if (this.isDraggingCell()){
      return false;
    }
  },

  cellMouseMove: function(e){

    if(!this.isDraggingCell()){
      var $cell = $(e.currentTarget);
      if(this.isOverRowDragHandle($cell,e.pageY)){
        this.$table.css("cursor","ns-resize");
      } else if(this.isOverColDragHandle($cell,e.pageX)){
        this.$table.css("cursor","ew-resize");
      } else {
        this.$table.css("cursor","pointer");
      }
    } else if(this.draggingRow){
      var height = e.pageY - this.draggedCell.offset().top;
      var width = null;
      var row_id = this.draggedCell.data('row_id');
      var col_id = this.draggedCell.data('col_id');
      this.getSheet().disableSend();
      this.getSheet().resizeCell(row_id,col_id,width,height);
      this.getSheet().enableSend();
      return false;
    } else if(this.draggingCol){
      var height = null;
      var width = e.pageX - this.draggedCell.offset().left;
      var row_id = this.draggedCell.data('row_id');
      var col_id = this.draggedCell.data('col_id');

            this.getSheet().disableSend();
      this.getSheet().resizeCell(row_id,col_id,width,height);
      this.getSheet().enableSend();
      return false;
    }
  },

  cellMouseUp: function(e){
    if(!this.isDraggingCell()) return;

    if(this.draggingRow){
      var height = e.pageY - this.draggedCell.offset().top;
      var width = null;
      var row_id = this.draggedCell.data('row_id');
      var col_id = this.draggedCell.data('col_id');

      this.getSheet().resizeCell(row_id,col_id,width,height);
    } else if(this.draggingCol){
      var height = null;
      var width = e.pageX - this.draggedCell.offset().left;
      var row_id = this.draggedCell.data('row_id');
      var col_id = this.draggedCell.data('col_id');

      this.getSheet().resizeCell(row_id,col_id,width,height);
    }

    this.draggedCell = null;
    this.draggingRow = false;
    this.draggingCol = false;
    return false;
  },

  resizeCell: function(row_id,col_id,width,height)
  {
    if(height) this.resizeRow(row_id,height);
    if(width) this.resizeCol(col_id,width);
    this.resizeRowHeader(row_id);
    this.resizeColHeader(col_id);
  },

// ## CELL DRAGGING

  isDraggingCell: function(){
    if (this.draggedCell) return true;
    return false;
  },

  isOverRowDragHandle: function($cell,y){
    var distance_from_cell_bottom = $cell.offset().top + $cell.height() - y;
    if(distance_from_cell_bottom < 4) return true;
    return false;
  },

  isOverColDragHandle: function($cell,x){
    var distance_from_cell_right = $cell.offset().left + $cell.width() - x;
    if(distance_from_cell_right < 4) return true;
    return false;
  },

  setCellDragTarget: function(e){
    if (this.draggedCell) return this.draggedCell;
    var $cell = $(e.currentTarget);
    if(this.isOverRowDragHandle($cell,e.pageY)){
      this.draggedCell = $cell;
      this.draggingRow = true;
      this.draggingCol = false;
    } else if(this.isOverColDragHandle($cell,e.pageX)) {
      this.draggedCell = $cell;
      this.draggingRow = false;
      this.draggingCol = true;
    } else {
      this.draggedCell = null;
    }
  },


// ## CELL INPUT FIELD

  createCellInput: function(e){
    if(e.currentTarget.length == 0) return;
    var s = this.getSelections().getLocal();
    var $el = $(e.currentTarget);
    var x = $el.position().left + this.$grid.scrollLeft();
    var y = $el.position().top + this.$grid.scrollTop();;
    var width = $el.width();
    var height = $el.height() - 2;
    var color = s.getColor();
    var row_id = $el.data().row_id.toString();
    var col_id = $el.data().col_id.toString();
    var cell_value = this.getSheet().getDisplayFormula(row_id,col_id);

    var $input = $("<input id='"+$el.attr('id')+"-input' data-row_id='"+row_id+"' data-col_id='"+col_id+"' class='es-table-cell-input' value='"+cell_value+"' style='left: "+x+"px; top: "+y+"px; width: "+width+"px; height: "+height+"px; background-color: "+color+";' />");
    
    this.$grid.append($input);
    $input.focus();
    var timer = null;
    var sheet = this.getSheet();
    $input.on('keyup', function(){
      sheet.updateCell(row_id, col_id, $input.val()); 
    });
    return $input;
  },

  removeCellInputs: function(){
    $('.es-table-cell-input').remove();
  },

  inputKeypress: function(e){
    //return unless code is 'enter' or 'tab' 
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code != 13 && code != 9) return;
    
    var UP    =-1;
    var LEFT  =-1;
    var DOWN  = 1;
    var RIGHT = 1;
    var NONE  = 0;

    var cells = this.getLocalSelection().getCells();
    _.each(cells, function(cell){
      this.getSheet().commitCell(cell.row_id.toString(), cell.col_id.toString());
    }, this);
    if(code == 13){
      this.moveSelection(e,1,0);
    }
    if(code == 9){
      this.moveSelection(e,0,1);
    }
    return false;
  },

  changeCell: function(e){
    var $el = $(e.currentTarget);
    var data = $el.data();
    this.getSheet().commitCell(data.row_id.toString(), data.col_id.toString());
  },


// ## CELL SELECTIONS

  selectCell: function(e){
    var s = this.getLocalSelection();
    var data = $(e.currentTarget).data();
    s.clear();
    s.addCell(this.getSheet().id,data.row_id.toString(),data.col_id.toString());
  },

  selectRow: function(e){
    var sel = this.getLocalSelection();
    var sheet = this.getSheet();
    var row_pos = $(e.currentTarget).text();
    var row_id = sheet.rowAt(row_pos - 1);
    sel.clear();
    sel.addRow(sheet.id, row_id);
  },

  selectCol: function(e){
    var sel = this.getLocalSelection();
    var sheet = this.getSheet();
    var col_id = $(e.currentTarget).attr('id').replace('es-col-header-','');
    sel.clear();
    sel.addColumn(sheet.id, col_id);
  },

  moveSelection: function(e, row_offset, col_offset){
    var selection = this.getLocalSelection();
    var old_cell = selection.getCells()[0];
    var rows = this.getSheet().rows;
    var cols = this.getSheet().cols;
    var new_col_idx = _.indexOf(cols,old_cell.col_id) + col_offset;
    var new_col = cols[new_col_idx];
    var new_row_idx = _.indexOf(rows,old_cell.row_id) + row_offset;
    var new_row = rows[new_row_idx];
    selection.clear();
    selection.addCell(this.getSheet().id, new_row, new_col);

  },

  onChangeCurrentSheetId: function(e){
    var sheet_id = this.getCurrentUser().getCurrentSheetId();
    var sheet = this.getSheets().get(sheet_id);
    this.setSheet(sheet);
    this.render();
  }

});

});
