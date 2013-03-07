if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module){
/*

  # Expression Helpers
  
  Helper methods and defined functions for expressions
  */

var ExpressionHelpers = module.exports = function(sheet_collection){
  this.sheet_collection = sheet_collection;
}

ExpressionHelpers.prototype.callFunction = function(func_name, args){
  return this[func_name].apply(this,args.reverse());
}

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
  console.log('cell_ref', cell);
  console.log('rawval', sheet.getRawValue(cell));
  return sheet.getRawValue(cell);
};

ExpressionHelpers.prototype.setSheet = function(sheet){
  this.sheet = sheet;
};
ExpressionHelpers.prototype.makecellreffunc = function(str, pre, cell_id, post){
  console.log('gotcellid', cell_id);
  this.sheet = this.sheet_collection.first();
  COL = 0;
    ROW = 1;
    var cell_id = cell_id.match(/[a-zA-Z]+|[0-9]+/g);
    var row_id = this.sheet.rowAt(cell_id[ROW] * 1 - 1);
    var col_id = this.sheet.colAt(this.sheet.identifierToIndex(cell_id[COL]));
    return pre + 'cellReference("' + this.sheet.id + '", "' + row_id + '", "' + col_id + '")' + post;
};
ExpressionHelpers.prototype.preprocessFormula = function(formula,collection,cid){
  this.sheet = collection.first();
  var cell_reference = /([^\d"'])([A-Za-z]+[0-9]+)([^A-Za-z'"]|$)/;
  var f = formula.replace(cell_reference, this.makecellreffunc);
  /*
  console.log('formula', formula);
  form = formula.replace(cell_reference, function(m){
    console.log('matched' , m);
    COL = 0;
    ROW = 1;
    var cell_id = m.match(/[a-zA-Z]+|[0-9]+/g);
    var sheet = collection.first();
    var row_id = sheet.rowAt(cell_id[ROW] * 1 - 1);
    var col_id = sheet.colAt(sheet.identifierToIndex(cell_id[COL]));
    return 'cellReference("' + sheet.id + '", "' + row_id + '", "' + col_id + '")';
  });
  */
  console.log(formula, 'turned into', f);
  return f;  
};

});
