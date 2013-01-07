if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module){
/*

  # Sheet

  Data model for a single spreadsheet.

*/

var _ = require('underscore');
var Backbone = require('backbone');
var config = require('es_client/config');
var uid = require('es_client/helpers/uid');

/*
var BROADCAST_TYPE = 'sheet';
var BROADCAST_EVENTS = [
  'addCell',
  'updateCell',
  'insertCol',
  'deleteCol',
  'insertRow',
  'deleteRow'
];
*/

var Sheet = module.exports = Backbone.Model.extend({
  initialize: function(o){
    o = o||{};
    var sheet_id = o.id||uid();
    this.send_enabled = true;
    this.set({id:sheet_id, silent:true});
    this.initializeRows();
    this.initializeCols();
    this.initializeCells();
  },
  initializeRows: function(){
    this.row_count = config.DEFAULT_ROW_COUNT;
    this.rows = [];
    for(var i = 0; i<this.row_count; i++){
      this.rows.push(i);
    }
  },
  initializeCols: function(){
    this.col_count = config.DEFAULT_COL_COUNT;
    this.cols = [];
    for(var i = 0; i<this.col_count; i++){
      this.cols.push(i);
    }
  },
  initializeCells: function(){
    this.cells = {};
  },
  sendEnabled: function(){
    return this.send_enabled;
  },
  enableSend: function(){
    this.send_enabled = true;
  },
  disableSend: function(){
    this.send_enabled = false;
  },
  send: function(msg){
    if(this.sendEnabled()){
      this.trigger('send',msg);
    }
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
  rowAt: function(index){
    return this.rows[index];
  },
  colAt: function(index){
    return this.cols[index];
  },
  insertRow: function(position){
    var new_id = uid();
    this.rows.splice(position,0,new_id);
    this.trigger('insert_row',{
      row_id:new_id,
      sheet_id:this.id
    });
    return new_id;
  },
  deleteRow: function(row_id){
    var row_pos = _.indexOf(this.rows,row_id);
    if(row_pos === -1) return false;
    this.cells[row_id] = {};
    this.rows.splice(row_pos,1);
    this.trigger('delete_row',{
      row_id:row_id,
      sheet_id:this.id
    });
    return true;
  },
  insertCol: function(position){
    var new_id = uid();
    this.cols.splice(position,0,new_id);
    this.trigger('insert_col',{
      col_id:new_id,
      sheet_id:this.id
    });
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
    es.trigger('delete_col',{
      col_id:col_id,
      sheet_id:this.id
    });
    return true;
  },
  updateCell: function(row_id,col_id,value){
    if(!this.rowExists(row_id)) return false;
    if(!this.colExists(col_id)) return false;
    if(!this.cells[row_id]) this.cells[row_id] = {};
    this.cells[row_id][col_id] = value;
    this.trigger('update_cell',{
      id:this.id,
      row_id:row_id,
      col_id:col_id,
      value:value
    });
    this.send({
      id: this.id,
      type: 'sheet',
      action: 'updateCell',
      params:[row_id,col_id,value]
    });
    return true;
  },
  getCell: function(row_id,col_id){
    if(!this.rowExists(row_id)) return undefined;
    if(!this.colExists(col_id)) return undefined;
    if(_.isUndefined(this.cells[row_id])) return null;
    return this.cells[row_id][col_id] || null;
  },
  getRawValue: function(row_id,col_id){
    var cell = this.getCell(row_id,col_id);
    return cell;
  },
  getValue: function(row_id, col_id){
    var raw = this.getRawValue(row_id, col_id);
    if(raw) return raw.toString();
    return '';
  },
  getColor: function(row_id, col_id){
    return '#ffffff';
  },
  setColor: function(row_id, col_id, color){
  },
  sync: function(method, model, options){
    // no sync for you
  }

});

});
