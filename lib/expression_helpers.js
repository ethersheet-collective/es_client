if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module){
/*

  # Expression Helpers
  
  Helper methods and defined functions for expressions
  */
var XRegExp = require('xregexp');
var lookbehind = require('lookbehind');
var _ = require('underscore');
lookbehind(XRegExp);
var ExpressionHelpers = module.exports = function(sheet_collection){
  this.sheet_collection = sheet_collection;
  this.userFunctions.sheet_collection = this.sheet_collection;
};

ExpressionHelpers.prototype.handleError = function(e){
  console.log(e);
  return e;
};

ExpressionHelpers.prototype.callFunction = function(function_name, args){
  var fn = function_name.toLowerCase();
  var args = args;
  if(this.userFunctions[fn]){
    if(_.isArray(args)){
      var args = args.reverse();
    }
    return this.userFunctions[fn].call(this,args);
  } else {
    return "ERR: No such function."
  }
};

ExpressionHelpers.prototype.getCellValue = function(cell_id){
  COL = 0;
  ROW = 1;
  var cell_id = cell_id.match(/[a-zA-Z]+|[0-9]+/g);
  var row_id = this.sheet.rowAt(cell_id[ROW] * 1 - 1);
  var col_id = this.sheet.colAt(this.sheet.identifierToIndex(cell_id[COL]));
  return this.sheet.getRawValue(this.cell);
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

ExpressionHelpers.prototype.loopThroughNums = function(initializer, args, cb){
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
}

ExpressionHelpers.prototype.userFunctions = {};
  /**********************************************
   * Make sure you make any function names all 
   * lower case alpha numeric, no _ or caps!!!
   * ********************************************/
  ExpressionHelpers.prototype.userFunctions.cellreference = function(args){
    var sheet_id = args[0];
    var row_id = args[1];
    var col_id = args[2];
    //console.log(this.sheet_collection.first().id, sheet_id);
    var sheet = this.sheet_collection.get(sheet_id);
    var cell = sheet.getCell(row_id, col_id);
    var value = sheet.getRawValue(cell);
    return value;
  };

  ExpressionHelpers.prototype.userFunctions.sum = function(addatives){
    var total = this.loopThroughNums(0,addatives,function(memo,item){
      memo += item * 1;
      return memo;
    });
    return total;
  };
  ExpressionHelpers.prototype.userFunctions.sum.def = "SUM(num1,num2,...)";
  ExpressionHelpers.prototype.userFunctions.sum.desc = "Sum zero or more numbers";

  ExpressionHelpers.prototype.userFunctions.product = function(args){
    if(_.contains(args,0)){return 0};
    var total = this.loopThroughNums(1,args,function(memo,item){
      memo = memo * item;
      return memo;
    });
    return total;
  };
  ExpressionHelpers.prototype.userFunctions.product.def = "PRODUCT(num1,num2,...)";
  ExpressionHelpers.prototype.userFunctions.product.desc = "Multiply zero or more numbers";
  
  ExpressionHelpers.prototype.userFunctions.abs = function(num){
    return Math.abs(num);
  };
  ExpressionHelpers.prototype.userFunctions.abs.def = "ABS(num)";
  ExpressionHelpers.prototype.userFunctions.abs.desc = "Get the absolute value of a number";

  ExpressionHelpers.prototype.userFunctions.acos = function(num){
    return Math.acos(num);
  };
  ExpressionHelpers.prototype.userFunctions.acos.def = "ACOS(num)";
  ExpressionHelpers.prototype.userFunctions.acos.desc = "Get the Arccosine of a number";

  ExpressionHelpers.prototype.userFunctions.asin = function(num){
    return Math.asin(num);
  };
  ExpressionHelpers.prototype.userFunctions.asin.def = "ASIN(num)";
  ExpressionHelpers.prototype.userFunctions.asin.desc = "Get the Arcsine of a number";

  ExpressionHelpers.prototype.userFunctions.atan = function(num){
    return Math.atan(num);
  };
  ExpressionHelpers.prototype.userFunctions.atan.def = "ATAN(num)";
  ExpressionHelpers.prototype.userFunctions.atan.desc = "Get the Arctangent of a number";

  ExpressionHelpers.prototype.userFunctions.atan2 = function(num){
    var y = num[0];
    var x = num[1];
    return Math.atan2(y, x);
  };
  ExpressionHelpers.prototype.userFunctions.atan2.def = "ATAN2(y,x)";
  ExpressionHelpers.prototype.userFunctions.atan2.desc = "Returns the arctangent of the quotient of its arguments"

  ExpressionHelpers.prototype.userFunctions.ceil = function(num){
    return Math.ceil(num);
  };
  ExpressionHelpers.prototype.userFunctions.ceil.def = "CEIL(num)";
  ExpressionHelpers.prototype.userFunctions.ceil.desc = "Return the smallest integer greater than or equal to a number";

  ExpressionHelpers.prototype.userFunctions.cos = function(num){
    return Math.cos(num);
  };
  ExpressionHelpers.prototype.userFunctions.cos.def = "COS(num)";
  ExpressionHelpers.prototype.userFunctions.cos.desc = "Get the cosine of a number";

  ExpressionHelpers.prototype.userFunctions.exp = function(num){
    return Math.exp(num);
  };
  ExpressionHelpers.prototype.userFunctions.cos.def = "COS(num)";
  ExpressionHelpers.prototype.userFunctions.cos.desc = "Get the cosine of a number";

  ExpressionHelpers.prototype.userFunctions.floor = function(num){
    return Math.floor(num);
  };
  ExpressionHelpers.prototype.userFunctions.cos.def = "COS(num)";
  ExpressionHelpers.prototype.userFunctions.cos.desc = "Get the cosine of a number";

  ExpressionHelpers.prototype.userFunctions.log = function(num){
    return Math.log(num);
  };
  ExpressionHelpers.prototype.userFunctions.log.def = "LOG(num)";
  ExpressionHelpers.prototype.userFunctions.log.desc = "Get the natural logarithm of a number";

  ExpressionHelpers.prototype.userFunctions.pow = function(num){
    var base = num[0];
    var exp = num[1];
    return Math.pow(base,exp);
  };
  ExpressionHelpers.prototype.userFunctions.pow.def = "POW(base, exponent)";
  ExpressionHelpers.prototype.userFunctions.pow.desc = "Get the base raised to the exponent";

  ExpressionHelpers.prototype.userFunctions.rand = function(){
    return Math.random();
  };
  ExpressionHelpers.prototype.userFunctions.random = function(){ return rand(); };
  ExpressionHelpers.prototype.userFunctions.rand.def = "RAND()";
  ExpressionHelpers.prototype.userFunctions.rand.desc = "Get a random number between 0 and 1";


  ExpressionHelpers.prototype.userFunctions.sin = function(num){
    return Math.sin(num);
  };
  ExpressionHelpers.prototype.userFunctions.sin.def = "SIN(num)";
  ExpressionHelpers.prototype.userFunctions.sin.desc = "Get the sine of a number";
  
  ExpressionHelpers.prototype.userFunctions.sqrt = function(num){
    return Math.sqrt(num);
  };
  ExpressionHelpers.prototype.userFunctions.sqrt.def = "SQRT(num)";
  ExpressionHelpers.prototype.userFunctions.sqrt.desc = "Get the square root of a number";
  
  ExpressionHelpers.prototype.userFunctions.tan = function(num){
    return Math.tan(num);
  };
  ExpressionHelpers.prototype.userFunctions.tan.def = "TAN(num)";
  ExpressionHelpers.prototype.userFunctions.tan.desc = "Get the tangent of a number";
  
});
