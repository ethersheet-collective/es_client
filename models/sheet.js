if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module){
/*

  # Sheet

  Data model for a single spreadsheet.
  Example:
  var sheet = {
    rows: [1,2,3] //an array of row id's
    cols: [1,2,3] //an array of column id's
    cells: {1: {1: {value: '=1+1', type: 'formula'}} // a sparse matrix of cell objects, stored like so sheet.cells[row_id][col_id] = cellObject
  }

  possible values for cell type: 'function', 'number', 'string', 'date', 'new'

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
    this.modifiedCells = {};
    
  },
  initializeRows: function(rows){
    if(_.isArray(rows)){
      this.rows = rows;
      return;
    }
    // default initialization
    this.rows = [];
    for(var i = 0; i<config.DEFAULT_ROW_COUNT; i++){
      this.rows.push(String(i));
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
      this.cols.push(String(i));
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
   *  b1 = {
   *    type: "number" or "formula" or "date" or "currency"
   *    value: 3 or "bob" or "=CELL(123,123,123)", // data stored on disk
   *    styles: ["bg-red","fg-white", "us_dollar"], //list of styles used for formatting cell
   *    
   *  # Derived methods
   *    getCellDisplay(): "47", // value in the table
   *    getForumlaDisplay(): "=A1"
   *}
   *
   * Sheets keep track of cells with uncommited changes
   *
   * uncomitted_cells: {....} // cell matrix
   *
   * Workflow should go like this:
   *
   * when a user edits a cell:
   *   table is notified
   *   sheet#updateCell is called
   * 
   * when a user edits a formula:
   *   formula editor is notified
   *   sheet#updateCell is called
   *
   * when a user ends editing:
   *    selection moves to 'next' cell
   *    the table calls sheet#commitCell
   *
   * on 'cell_updated':
   *    the formula display is updated
   *    the table display is updated
   *
   * on 'cell_committed':
   *    the formula display is updated
   *    the table display is updated
   *
   * sheet#updateCell:
   *    gets an existing cell or creates a new cell
   *    modifies a cell in uncommitted_cells
   *    emits 'cell_updated' event 
   *    sends a 'cell_updated' socket event (maybe this is buffered) 
   
   *
   * sheet#commitCell:
   *   the updated cell's display values are derived if it is a formula
   *   the original cell is replaced by the updated cell
   *   the sheet#refreshCell is called for each formula cell
   *   'cell_committed' is emitted
   *   'cell_committed' is sent over the socket 
   *
   *
   * when a sheet#refreshCell is called:
   *   the cell recalculates it's value
   *   it emits 'cell_updated'
   *   cell reference should call refresh cell 
   *
   * ***********************************************/
  updateCell: function(row_id,col_id,value){
    var cell = {value: value, type:'new'};
    this.addCell(row_id, col_id, cell, this.cells);
    this.trigger('update_cell',{
      id:this.id,
      row_id:row_id,
      col_id:col_id,
      cell_display:value
    });
    this.send({
      id: this.id,
      type: 'sheet',
      action: 'updateCell',
      params:[row_id,col_id,value]
    });
    return true;
  },
  commitCell: function(row_id,col_id){
    var cell = this.getCell(row_id,col_id);
    cell.type = this.getCellType(cell.value); 
    cell_display = this.getCellDisplay(cell);
    this.trigger('commit_cell', _.extend(_.clone(cell),{
      id:this.id,
      row_id:row_id,
      col_id:col_id,
      cell_display:cell_display
    }));
    this.send({
      id: this.id,
      type: 'sheet',
      action: 'commitCell',
      params:[row_id,col_id,cell]
    });
    var self = this;
    _.each(self.getFormulaCells(), function(idx){
      self.refreshCell(cell[0],cell[1]);
    });
  },
  getFormulaCells: function(){
    var formula_cells = [];
    _.each(this.cells, function(cols,row){
      _.each(cols, function(cell,col){
        if(cell.type == 'formula'){
          formula_cells.push([row,col]);
        }
      });
    });
    return formula_cells;
  },
  refreshCell: function(row_id,col_id){
    var cell = this.getCell(row_id,col_id);
    var display_value = ''
    try{
      display_value = this.getCellDisplay(cell);
    } catch (e) {
      display_value = e.message;
    }
    this.trigger('update_cell',{
      id:this.id,
      row_id:row_id,
      col_id:col_id,
      value:display_value
    });
    return display_value;
  },
  getCellType: function(cell_value){
    if(_.isNumber(cell_value)) return 'number';
    if(cell_value.charAt(0) == '=') return 'formula';
    if(_.isString(cell_value) && _.isNaN(cell_value * 1)) return 'string';
    if(_.isString(cell_value) && _.isFinite(cell_value * 1)) return 'number';
    throw 'Undefined Cell Type ' + cell_value;
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
  getCellValue: function(row_id,col_id){
    cell = this.getCell(row_id,col_id);
    if(!cell) return '';
    return cell.value;
  },
  addCell: function(row_id,col_id,cell){
    if(!this.rowExists(row_id)) return false;
    if(!this.colExists(col_id)) return false;
    if(!this.cells[row_id]) this.cells[row_id] = {};
    this.cells[row_id][col_id] = cell;
    return true;
  },
  //TODO: Delete me!
  getDisplayValue: function(row_id, col_id){
    console.warn("Warning: getDisplayValue is deperecated, use getCellDisplay instead");
    return '';
  },
  getCellDisplay: function(cell){
    if(!cell) return '';
    if(!(cell.type == 'formula')) return cell.value; //do nothing if cell is not a formula
    return String(this.parseValue(cell.value));
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
