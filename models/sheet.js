if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module){
/*

  # Sheet

  Data model for a single spreadsheet.

*/

var _ = require('underscore');
var ESModel = require('./es_model');
var config = require('es_client/config');
var uid = require('es_client/helpers/uid');

var Sheet = module.exports = ESModel.extend({

// # Initialization

  initialize: function(o){
    o = o||{};
    this.id = o.id||uid();
    this.send_enabled = true;
    this.initializeRows(o.rows);
    this.initializeCols(o.cols);
    this.initializeCells(o.cells);
    
  },
  initializeRows: function(rows){
    if(_.isArray(rows)){
      this.rows = rows;
      return;
    }
    // default initialization
    this.rows = [];
    for(var i = 0; i<config.DEFAULT_ROW_COUNT; i++){
      this.rows.push(i);
    }
  },
  initializeCols: function(cols){
    if(_.isArray(cols)){
      this.cols = cols;
      return;
    }
    // default initialization
    this.cols = [];
    for(var i = 0; i<config.DEFAULT_COL_COUNT; i++){
      this.cols.push(i);
    }
  },
  initializeCells: function(cells){
    this.cells = cells || {};
  },

// # Rows
  
  rowCount: function(){
    return this.rows.length;
  },
  rowIds: function(){
    return this.rows;
  },
  rowExists: function(row_id){
    return _.include(this.rows,row_id);
  },
  rowAt: function(index){
    return this.rows[index];
  },
  /* takes a column identifier ('A') and converts it to an array index */
  identifierToIndex: function(letters){
    var scale = 1;
    var pieces = letters.toLowerCase().split('');
    var idx = _.reduceRight(pieces, function(memo,letter){
      var pos = (letter.charCodeAt(0) - 96) * scale;
      scale = scale * 26;
      return memo + pos; 
    }, -1);
    return idx;
       
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

// # Collumns

  colCount: function(){
    return this.cols.length;
  },
  colIds: function(){
    return this.cols;
  },
  colExists: function(col_id){
    return _.include(this.cols,col_id);
  },
  colAt: function(index){
    return this.cols[index];
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

// # Cells
  //TODO: refactor cell model and how updateCell and commitCell work
  /****************************************************
   * Thoughts on refactoring cells
   * Cells could be an object like this:
   * {
   *    formula: "=CELL(0,1,1)", // internal formula representation
   *    display_formula: "=A1", // formula displayed to user
   *    value: "3", //parsed value used in calculating other formulae
   *    styles: ["bg-red","fg-white"] //list of styles used for formatting cell
   * }
   *
   * Workflow should go like this:
   * when a user edits a cell:
   *   if the user has changed the value:
   *    updateCell will be called at intervals
   *    updateCell checks if a cell object already exists and creates one if not
   *    update the display formula and value
   *    this triggers a callback which updates the text of the cell element
   *
   * when a user commits a cell:
   *   commitCell is called and parses the display_formula and then parses the formula, it then updates the value
   *   triggers a callback which updates the cell text
   *
   * when a user styles a cell:
   *  styleCell is called and passed a cell and a class
   *  triggers a callback which updates the css for that cell.
   *
   * ***********************************************/
  updateCell: function(row_id,col_id,value,display_value){
    console.log('UPDATE CELL', value, display_value);
    if(!this.rowExists(row_id)) return false;
    if(!this.colExists(col_id)) return false;
    if(!this.cells[row_id]) this.cells[row_id] = {};

    var cell = this.cells[row_id][col_id] || {};
    if(display_value){
      cell.display_value = display_value; 
    } else {
      cell.display_value =  value;
    }

    this.trigger('update_cell',{
      id:this.id,
      row_id:row_id,
      col_id:col_id,
      value:value,
      display_value: cell.display_value
    });
    this.send({
      id: this.id,
      type: 'sheet',
      action: 'updateCell',
      params:[row_id,col_id,value, display_value]
    });
    return true;
  },
  commitCell: function(row_id,col_id,cell){
    if(!_.isObject(cell)){
      var cell = {
        value:cell.toString(),
        display_value: undefined
      };
    }
    try{
      cell.display_value = this.parseValue(cell.value);
    } catch (e) {
      cell.display_value = e.message;
    }
    var cell_updated = this.updateCell(row_id,col_id,cell.value,cell.display_value);
    this.cells[row_id][col_id] = cell;
    this.trigger('commit_cell', _.extend(_.clone(cell),{
      id:this.id,
      row_id:row_id,
      col_id:col_id
    }));
    this.send({
      id: this.id,
      type: 'sheet',
      action: 'commitCell',
      params:[row_id,col_id,cell]
    });
  },
  parseValue: function(value){
    if(value.charAt(0) != '=') return value;
    this.collection.setParserSheet(this);
    var parsed = this.collection.parser.parse(value.slice(1));
    return parsed;
  },
  getCell: function(row_id,col_id){
    if(!this.rowExists(row_id)) return undefined;
    if(!this.colExists(col_id)) return undefined;
    if(_.isUndefined(this.cells[row_id])) return null;
    return this.cells[row_id][col_id] || null;
  },
  getValue: function(row_id, col_id){
    var cell = this.getCell(row_id, col_id);
    if(cell) return cell.value.toString();
    return '';
  },
  getDisplayValue: function(row_id, col_id){
    return this.getParsedValue(row_id,col_id);
  },
  getParsedValue: function(row_id,col_id){
    var cell = this.getCell(row_id, col_id);
    if(cell) {
      if(cell.display_value){
        return cell.display_value.toString();
      }
      return cell.value.toString(); 
    }
    return '';
  },
  getCells: function(){
    return this.cells;
  },

// # Colors

  getColor: function(row_id, col_id){
    return '#ffffff';
  },
  setColor: function(row_id, col_id, color){
  }

});

});
