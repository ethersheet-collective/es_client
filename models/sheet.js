if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require){

/*
	model Sheet
*/	
var _ = require('underscore');
var Backbone = require('backbone');
var config = require('es_client/config');
var uid = require('es_client/helpers/uid');

return Backbone.Model.extend({
  initialize: function(){
    this.initializeRows();
    this.initializeCols();
    this.initializeCells();
  },
  initializeRows: function(){
    this.row_count = config.DEFAULT_ROW_COUNT;
    this.rows = [];
    for(var i = 0; i<this.row_count; i++){
      this.rows.push(uid());
    }
  },
  initializeCols: function(){
    this.col_count = config.DEFAULT_COL_COUNT;
    this.cols = [];
    for(var i = 0; i<this.col_count; i++){
      this.cols.push(uid());
    }
  },
  initializeCells: function(){
    this.cells = {};
  },
  rowCount: function(){
    return this.row_count;
  },
  colCount: function(){
    return this.col_count;
  },
  rowIds: function(){
    return this.rows; 
  },
  colIds: function(){
    return this.cols; 
  },
  rowExists: function(row_id){
    return _.include(this.rows,row_id);
  },
  colExists: function(col_id){
    return _.include(this.cols,col_id);
  },
  insertRow: function(position){
    var new_id = uid();
    this.rows.splice(position,0,new_id);
    this.trigger('insert_row',new_id);
    return new_id;
  },
  deleteRow: function(row_id){
    var row_pos = _.indexOf(this.rows,row_id);
    if(row_pos === -1) return false;
    this.cells[row_id] = {};
    this.rows.splice(row_pos,1);
    this.trigger('delete_row',row_id);
    return true;
  },
  insertCol: function(position){
    var new_id = uid();
    this.cols.splice(position,0,new_id);
    this.trigger('insert_col',new_id);
    return new_id;
  },
  deleteCol: function(col_id){
    var es = this;
    var col_pos = _.indexOf(es.cols,col_id);
    if(col_pos === -1) return false;
    _.each(es.rows,function(row_id){
      if(es.cells[row_id]){
         delete es.cells[row_id][col_id];
      }
    });
    es.cols.splice(col_pos,1);
    es.trigger('delete_col',col_id);
    return true;
  },
  updateCell: function(row_id,col_id,value){
    if(!this.rowExists(row_id)) return false;
    if(!this.colExists(col_id)) return false;
    if(!this.cells[row_id]) this.cells[row_id] = {};
    this.cells[row_id][col_id] = value;
    this.trigger('update_cell',row_id,col_id,value);
    return true;
  },
  getRawValue: function(row_id,col_id){
    if(!this.rowExists(row_id)) return undefined;
    if(!this.colExists(col_id)) return undefined;
    if(_.isUndefined(this.cells[row_id])) return null; 
    return this.cells[row_id][col_id] || null;
  },
  getValue: function(row_id, col_id){
    var raw = this.getRawValue(row_id, col_id);
    if(raw) return raw.toString();
    return '';
  }
});

});
