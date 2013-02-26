if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module){
/*

  # Expression Helpers
  
  Helper methods and defined functions for expressions
  */

var ExpressionHelpers = module.exports = function(sheet_collection){
  this.sheet_collection = sheet_collection;
}

ExpressionHelpers.prototype.getCellValue = function(cell_id){
  var row_id = this.sheet.rowAt(cell_id[1] * 1 - 1);
  var col_id = this.sheet.colAt(this.sheet.identifierToIndex(cell_id[0]));
  this.cell = this.sheet.getCell(row_id,col_id);
  return this.sheet.getRawValue(this.cell);
};

ExpressionHelpers.prototype.setSheet = function(sheet){
  this.sheet = sheet;
};

});
