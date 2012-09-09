if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require){

/*
	model Sheet
*/	

var _ = require('underscore');
var Backbone = require('backbone');
var config = require('es_client/config');

return Backbone.Model.extend({
  initialize: function(){
    this.cells = [];
    this.sheets = {};
  },

  addCell: function(sheet,row_id,col_id){
    var cell = {
      sheet_id: sheet.id,
      col_id: col_id,
      row_id: row_id
    };
    this.cells.push(cell);
    this.addSheet(sheet);
    this.trigger('add_cell',cell);
  },

  clear: function(should_emit){
    this.cells = [];
    this.removeSheets();
    if(should_emit) this.trigger('change');
  },

  getCells: function(){
    return this.cells;
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
    s = this;
    for(var id in this.sheets){
      console.log('trying to remove sheet ' + id);
      s.removeSheet(id);
    }
  },
  removeSheet: function(sheet_id){
    console.log('removing sheet ' + sheet_id);
    if(!this.sheets[sheet_id]) return false;
    this.sheets[sheet_id].off(null,null,this);
    delete this.sheets[sheet_id];
  },

  updateCell: function(){
    this.trigger('change'); 
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
  },

  removeSheet: function(o){
    if(!this.sheets[o.id]) return;

    var sel = this;
    var changed = false;
    
    this.cells = _.filter(this.cells,function(cell,index){
      if(cell.sheet_id == o.id){
        changed = true;
        return false;
      }
      return true;
    });

    this.sheets[o.id].off(null,null,this);
    delete this.sheets[o.id];

    if(changed) this.trigger('change');
  },

  getSheets: function(){
    return this.sheets;
  }

});

});
