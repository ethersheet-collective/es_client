if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){

/*

  # Selection

  Data model for a single selection.

  ## Custom Events
  * add_cell

  ## References
  * Sheet

*/

var _ = require('underscore');
var ESModel = require('./es_model');
var config = require('../config');
var uid = require('../helpers/uid');

var Selection = module.exports = ESModel.extend({
  initialize: function(o){
    o = o || {};
    var selection = this;
    this.id = o.id||uid();
    this.cells = [];
    this.send_enabled  = true;
    this.sheet_id = null;
    this.user_id = o.user_id;
    this.color = o.color || config.DEFAULT_SELECTION_COLOR;

    if(o.sheet_id) this.setSheet(o.sheet_id);
    setTimeout(function(){
     if(o.cells) selection.addCells(o.cells);
    },0);
  },

  clear: function(silent){
    this.clearCellColors();
    var cleared_cells = this.cells;
    this.cells = [];
    if(silent) return;
    this.trigger('change');
    this.trigger('clear', cleared_cells);
    this.send({
      id: this.id,
      type: 'selection',
      action: 'clear',
      params: [false]
    });
  },

  getColor: function(){
    return this.color; 
  },

  setColor: function(color){
    this.color = color; 
  },

  clearCellColors: function(){
    var s = this;
    var sheet = this.collection.getSheet(this.sheet_id);
    _.each(this.cells, function(cell){
      if(!this.sheet_id == cell.sheet_id) return;
      sheet.setColor(config.DEFAULT_COLOR);
    });
  },
  
  getData: function(){
    return {
      id: this.id,
      sheet_id: this.sheet_id,
      user_id: this.user_id,
      cells: this.cells
    }
  },

  getCells: function(){
    return this.cells;
  },

  addCell: function(sheet_id,row_id,col_id,supress_triggers){
    this.setSheet(sheet_id);
    var sheet = this.collection.getSheet(sheet_id);
    var cell = {
      sheet_id: sheet_id,
      col_id: col_id,
      row_id: row_id,
      color: this.color
    };
    sheet.setColor(row_id, col_id, this.color);
    this.cells.push(cell);
    if(!supress_triggers){
      this.trigger('add_cell',cell);
      this.send({
        id: this.id,
        type: 'selection',
        action: 'addCell',
        params: [sheet_id,row_id,col_id]
      });
    }
  },
  
  addRow: function(sheet_id,row_id){
    var self = this;
    this.setSheet(sheet_id);
    var sheet = this.collection.getSheet(sheet_id);
    _.each(sheet.cols, function(col_id){
      self.addCell(sheet_id,row_id,col_id,true);
    });
    this.trigger('select_row',self.getCells());
    this.send({
      id: this.id,
      type: 'selection',
      action: 'addRow',
      params: [sheet_id,row_id]
    });
  },

  addColumn: function(sheet_id,col_id){
    var self = this;
    self.setSheet(sheet_id);
    var sheet = this.collection.getSheet(sheet_id);
    _.each(sheet.rows, function(row_id){
      self.addCell(sheet_id,row_id,col_id,true);
    });
    this.trigger('select_col',self.getCells());
    this.send({
      id: this.id,
      type: 'selection',
      action: 'addColumn',
      params: [sheet_id,col_id]
    });
    
  },

  redraw: function(){
    var self = this;
    _.each(this.cells, function(c){
      self.trigger('add_cell',c);
    });
  },

  addCells: function(cells){
    var selection = this;
    _.each(cells,function(cell){
      selection.addCell(cell.sheet_id, cell.row_id, cell.col_id); 
    });
  },

  updateCell: function(){
    this.trigger('change');
  },

  setSheet: function(sheet_id){
    if(this.sheet_id == sheet_id) return;
    
    this.unsetSheet();
    
    var sheet = this.collection.getSheet(sheet_id);
    if(!sheet) return;
    sheet.on('update_cell',this.updateCell,this);
    sheet.on('delete_col',this.removeCol,this);
    sheet.on('delete_row',this.removeRow,this);
    sheet.on('destroy',this.unsetSheet,this);
    
    this.sheet_id = sheet_id;
  },

  unsetSheet: function(){
    if(!this.sheet_id) return;
    this.clear();
    
    var sheet = this.collection.getSheet(this.sheet_id);
    sheet.off(null,null,this);

    this.sheet_id = null;
  },

  removeCol: function(o){
    var sel = this;
    var changed = false;
    this.cells = _.filter(this.cells,function(cell,index){
      if(cell.sheet_id == o.sheet_id
         && cell.col_id == o.col_id){
        changed = true;
        return false;
      }
      return trueadd_format;
    });
    if(changed) this.trigger('change');
  },

  removeRow: function(o){
    var sel = this;
    var changed = false;
    this.cells = _.filter(this.cells,function(cell,index){
      if(cell.sheet_id == o.sheet_id
         && cell.row_id == o.row_id){
        changed = true;
        return false;
      }
      return true;
    });
    if(changed) this.trigger('change');
  },

  onDestroy: function(){
    this.unsetSheet();
  },

  addFormat: function(format, selection_id){
    var self = this;
    this.trigger('add_format', format); 
    this.send({
      id: this.id,
      type: 'selection',
      action: 'addFormat',
      params: [format, selection_id]
    });
    _.each(this.cells, function(cell){
      self.collection.getSheet(cell.sheet_id).addFormatToCell(cell.row_id, cell.col_id, format);
    });
  },
});

});
