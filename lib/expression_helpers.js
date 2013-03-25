if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module){
/*

  # Expression Helpers
  
  Helper methods and defined functions for expressions
  */
var XRegExp = require('xregexp');
var lookbehind = require('lookbehind');
lookbehind(XRegExp);
var ExpressionHelpers = module.exports = function(sheet_collection){
  this.sheet_collection = sheet_collection;
};

ExpressionHelpers.prototype.callFunction = function(func_name, args){
  return this[func_name].apply(this,args.reverse());
};

ExpressionHelpers.prototype.getCellValue = function(cell_id){
  COL = 0;
  ROW = 1;
  var cell_id = cell_id.match(/[a-zA-Z]+|[0-9]+/g);
  var row_id = this.sheet.rowAt(cell_id[ROW] * 1 - 1);
  var col_id = this.sheet.colAt(this.sheet.identifierToIndex(cell_id[COL]));
  return this.sheet.getRawValue(this.cell);
};

ExpressionHelpers.prototype.cellReference = function(sheet_id,row_id,col_id){
  var sheet = this.sheet_collection.get(sheet_id);
  var cell = sheet.getCell(row_id, col_id);
  var value = sheet.getRawValue(cell);
  return value;
};

ExpressionHelpers.prototype.setSheet = function(sheet){
  this.sheet = sheet;
};

//convert an ethersheet style cell reference to an excel style reference 
ExpressionHelpers.prototype.xlRefToEsRef = function(formula){
  var self = this;
  var sig = /cellReference\(([-_a-zA-Z0-9_," ]+)\)/g;
  var f = formula.replace(sig,function(str,args){
    args = args.split(', ');
    sheet_id = args[0].slice(1,-1);
    row_id = args[1].slice(1,-1);
    col_id = args[2].slice(1,-1);
    var sheet = self.sheet_collection.get(sheet_id);
    row_idx = sheet.rows.indexOf(row_id) + 1;
    col_idx = sheet.cols.indexOf(col_id) + 1;
    return self.excelColumnFromNumber(col_idx) + row_idx;
  });
  return f;
};
ExpressionHelpers.prototype.excelColumnFromNumber = function(columnNumber) {
    var columnString = "";
    while (columnNumber > 0) {
        var currentLetterNumber = (columnNumber - 1) % 26;
        var currentLetter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(currentLetterNumber);
        columnString = currentLetter + columnString;
        columnNumber = (columnNumber - (currentLetterNumber + 1)) / 26;
    }
    return columnString;
};

ExpressionHelpers.prototype.preprocessFormula = function(formula,collection,cid){
  var sheet = this.sheet_collection.first();
 // ([^"'0-9_$-])([a-zA-Z]+[\d]+)(?!["'a-zA-Z_-])
  var cell_reference = /([a-zA-Z]+[\d]+)(?!["'a-zA-Z_-]+)/g;
  var lookbehind = '(?<!["a-zA-Z0-9_$-]+)';

  //translate excel style cell references like A1 into ethersheet formula
  var f = XRegExp.replaceLb(formula, lookbehind, cell_reference, function(str,pre,cell_id,post){
    COL = 0;
    ROW = 1;
    var cell_id = str.match(/[a-zA-Z]+|[0-9]+/g);
    var row_id = sheet.rowAt(cell_id[ROW] * 1 - 1);
    var col_id = sheet.colAt(sheet.identifierToIndex(cell_id[COL]));
    return 'cellReference("' + sheet.id + '", "' + row_id + '", "' + col_id + '")';
  });
  return f;  
};

});
