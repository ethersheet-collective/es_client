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
var config = require('es_client/config');
var uid = require('es_client/helpers/uid');
var SelectionCollection = require('es_client/models/selection_collection');

var Selection = module.exports = ESModel.extend({
  initialize: function(o){
    o = o || {};
    this.id = o.id||uid();
    this.cells = [];
    this.sheets = {};
    this.send_enabled  = true;
    this.color = o.color || config.DEFAULT_SELECTION_COLOR;
  },

  clear: function(silent){
    this.clearCellColors();
    var cleared_cells = this.cells;
    this.cells = [];
    this.removeSheets();
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
    _.each(this.cells, function(cell){
      if(!s.sheets[cell.sheet_id]) return;
      s.sheets[cell.sheet_id].setColor(config.DEFAULT_COLOR);
    });
  },
  
  getData: function(){
    return {
      id: this.id,
      sheet: this.sheets,
      cells: this.cells,
      color: this.color
    }
  },

  getCells: function(){
    return this.cells;
  },

  addCell: function(sheet,row_id,col_id){
    var selection = this;
    var cell = {
      sheet_id: sheet.id,
      col_id: col_id,
      row_id: row_id,
      color: this.color
    };
    console.log('sheet',sheet);
    //sheet.setColor(row_id, col_id, this.color);
    this.cells.push(cell);
    //this.addSheet(sheet);
    this.trigger('add_cell',cell);
    this.send({
      id: this.id,
      type: 'selection',
      action: 'addCell',
      params: [sheet,row_id,col_id]
    });
  },

  updateCell: function(){
    this.trigger('change');
  },

  getSheets: function(){
    return this.sheets;
  },

  addSheet: function(sheet){
    if(this.sheets[sheet.id]) return false;
    sheet.on('update_cell',this.updateCell,this);
    sheet.on('delete_col',this.removeCol,this);
    sheet.on('delete_row',this.removeRow,this);
    sheet.on('destroy',this.removeSheet,this);
    this.sheets[sheet.id] = sheet;
    return true;
  },

  removeSheets: function(){
    var s = this;
    for(var id in this.sheets){
      s.removeSheet(id);
    }
  },
  removeSheet: function(sheet_id){
    /*polymorph incase we got an object instead of an id from backbone by calling sheet.destroy()*/
    if(sheet_id.id) sheet_id = sheet_id.id
    
    if(!this.sheets[sheet_id]) return;

    var sel = this;
    var changed = false;

    this.cells = _.filter(this.cells,function(cell,index){
      if(cell.sheet_id == sheet_id){
        changed = true;
        return false;
      }
      return true;
    });

    this.sheets[sheet_id].off(null,null,this);
    delete this.sheets[sheet_id];

    if(changed) this.trigger('change');
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
      return true;
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
  }

});

});
