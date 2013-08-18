if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module){
/*

  # Expression Helpers
  
  Helper methods and defined functions for expressions
  */
var _ = require('underscore');
var lookbehind = require('lookbehind');
var XRegExp = require('xregexp');
lookbehind(XRegExp);
var intializeExpressionHelpers = module.exports = function(data){
  exh.es_data = data;
  return exh;
}

var exh = {

handleError: function(e){
  console.log(e);
  return e;
},

callFunction: function(function_name, args){
  var fn = function_name.toLowerCase();
  var args = args;
  if(exh.userFunctions[fn]){
    if(_.isArray(args)){
      var args = args.reverse();
    }
    return exh.userFunctions[fn].method.call(exh,args);
  } else {
    return "ERR: No such function."
  }
},

getCellValue: function(data,cell_id){
  COL = 0;
  ROW = 1;
  var sheet = exh.es_data.users.getCurrentUser().getCurrentSheetId();
  var cell_id = cell_id.match(/[a-zA-Z]+|[0-9]+/g);
  var row_id = sheet.rowAt(cell_id[ROW] * 1 - 1);
  var col_id = sheet.colAt(this.sheet.identifierToIndex(cell_id[COL]));
  return sheet.getRawValue(this.cell);
},

//convert an ethersheet style cell reference to an excel style reference 
xlRefToEsRef: function(formula){
  var self = exh;
  var sig = /cellReference\(([-_a-zA-Z0-9_," ]+)\)/g;
  var f = formula.replace(sig,function(str,args){
    args = args.split(', ');
    sheet_id = args[0].slice(1,-1);
    row_id = args[1].slice(1,-1);
    col_id = args[2].slice(1,-1);
    var sheet = exh.es_data.sheets.get(sheet_id);
    row_idx = sheet.indexForRow(row_id) + 1;
    col_idx = sheet.indexForCol(col_id) + 1;
    return self.excelColumnFromNumber(col_idx) + row_idx;
  });
  return f;
},
excelColumnFromNumber: function(columnNumber) {
    var columnString = "";
    while (columnNumber > 0) {
        var currentLetterNumber = (columnNumber - 1) % 26;
        var currentLetter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(currentLetterNumber);
        columnString = currentLetter + columnString;
        columnNumber = (columnNumber - (currentLetterNumber + 1)) / 26;
    }
    return columnString;
},

preprocessFormula: function(formula,id){
  var sheet = exh.es_data.sheets.get(id);
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
},

loopThroughNums: function(initializer, args, cb){
  var total = initializer;
    if(!_.isArray(args)){return args * 1;}
    for(var i = 0; i < args.length; i++) {
      if(_.isNaN(args[i] * 1)){
        continue;
      } else {
        total = cb(total, args[i]);
      }
    }
    return total;
},

userFunctions: {
  /**********************************************
   * Make sure you make any function names all 
   * lower case alpha numeric, no _ or caps!!!
   * ********************************************/
  cellreference:{
    method: function(args){
      var sheet_id = args[0];
      var row_id = args[1];
      var col_id = args[2];
      var sheet = exh.es_data.sheets.get(sheet_id);
      var cell = sheet.getCell(row_id, col_id);
      var value = sheet.getRawValue(cell);
      return value;
    },
  },

  sum:{
    method: function(addatives){
      var total = this.loopThroughNums(0,addatives,function(memo,item){
        memo += item * 1;
        return memo;
      });
      return total;
    },
    def: "SUM(num1,num2,...)",
    desc: "Sum zero or more numbers",
  },

  product: {
    method: function(args){
      if(_.contains(args,0)){return 0};
      var total = this.loopThroughNums(1,args,function(memo,item){
        memo = memo * item;
        return memo;
      });
      return total;
    },
    def: "PRODUCT(num1,num2,...)",
    desc: "Multiply zero or more numbers",
  },
  
  abs:{
    method: function(num){
      return Math.abs(num);
    },
    def: "ABS(num)",
    desc: "Get the absolute value of a number",
  },

  acos: {
    method: function(num){
      return Math.acos(num);
    },
    def: "ACOS(num)",
    desc: "Get the Arccosine of a number",
  },

  asin:{
    method: function(num){
      return Math.asin(num);
    },
    def: "ASIN(num)",
    desc: "Get the Arcsine of a number",
  },

  atan:{
    method: function(num){
      return Math.atan(num);
    },
    def: "ATAN(num)",
    desc: "Get the Arctangent of a number",
  },

  atan2: {
    method: function(num){
      var y = num[0];
      var x = num[1];
      return Math.atan2(y, x);
    },
    def: "ATAN2(y,x)",
    desc: "Returns the arctangent of the quotient of its arguments"
  },

  ceil: {
    method: function(num){
      return Math.ceil(num);
    },
    def: "CEIL(num)",
    desc: "Return the smallest integer greater than or equal to a number",
  },

  cos: {
    method: function(num){
      return Math.cos(num);
    },
    def: "COS(num)",
    desc: "Get the cosine of a number",
  },

  exp: {
    method: function(num){
      return Math.exp(num);
    },
    def: "COS(num)",
    desc: "Get the cosine of a number",
  },

  floor: {
    method: function(num){
      return Math.floor(num);
    },
    def: "COS(num)",
    desc: "Get the cosine of a number",
  },

  log: {
    method: function(num){
      return Math.log(num);
    },
    def: "LOG(num)",
    desc: "Get the natural logarithm of a number",
  },

  pow: {
    method: function(num){
      var base = num[0];
      var exp = num[1];
      return Math.pow(base,exp);
    },
    def: "POW(base, exponent)",
    desc: "Get the base raised to the exponent",
  },

  rand: {
    method: function(){
      return Math.random();
    },
  },

  random: {
    method: function(){ return rand(); },
    def: "RAND()",
    desc: "Get a random number between 0 and 1",
  },

  sin: {
    method: function(num){
      return Math.sin(num);
    },
    def: "SIN(num)",
    desc: "Get the sine of a number",
  },

  sqrt: {
    method: function(num){
      return Math.sqrt(num);
    },
    def: "SQRT(num)",
    desc: "Get the square root of a number",
  },

  tan: {
    method: function(num){
      return Math.tan(num);
    },
    def: "TAN(num)",
    desc: "Get the tangent of a number",
  },
  
}
};
});
