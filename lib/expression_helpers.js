if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function(require,exports,module){
  /*

    # Expression Helpers
    
    Helper methods and defined functions for expressions
    */
  var _ = require('underscore');
  var lookbehind = require('lookbehind');
  var XRegExp = require('xregexp');
  var i18n = require('i18next');
  i18n.init();
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

    parseCellValue: function(cell_id){
      var COL = 0;
      var ROW = 1;
      var sheet_id = exh.es_data.users.getCurrentUser().getCurrentSheetId();
      var sheet = exh.es_data.sheets.get(sheet_id);
      var cell_id = cell_id.match(/[a-zA-Z]+|[0-9]+/g);
      var row_id = sheet.rowAt(cell_id[ROW] * 1 - 1);
      var col_id = sheet.colAt(sheet.identifierToIndex(cell_id[COL]));
      var cell = sheet.getCell(row_id,col_id);
      return sheet.getRawValue(cell);
    },

    parseCellRange: function(cell_range){
      var COL = 0;
      var ROW = 1;
      var sheet_id = exh.es_data.users.getCurrentUser().getCurrentSheetId();
      var sheet = exh.es_data.sheets.get(sheet_id);
      var coords = cell_range.split(":");
      var topLeftCID = this.xlRefToEsRef(coords[0]);
      var bottomRightCID = this.xlRefToEsRef(coords[1]);
      var tl_cell_id = topLeftCID.match(/[a-zA-Z]+|[0-9]+/g);
      var tl_row_idx = tl_cell_id[ROW] * 1 - 1;
      var tl_col_idx = sheet.identifierToIndex(tl_cell_id[COL]);
      var br_cell_id = bottomRightCID.match(/[a-zA-Z]+|[0-9]+/g);
      var br_row_idx = br_cell_id[ROW] * 1 - 1;
      var br_col_idx = sheet.identifierToIndex(br_cell_id[COL]);
      var cell_values = [];
      for(var i = tl_row_idx; i <= br_row_idx; i++){
        for(var j = tl_col_idx; j <= br_col_idx; j++){
          cell_values.push(sheet.getRawValue(sheet.getCell(sheet.rowAt(i),sheet.colAt(j))));
        }
      }
      return cell_values;
    },

    //Convert an ethersheet style cell reference to an excel style reference 
    xlRefToEsRef: function(formula){
      var self = exh;
      var sig = /cellReference\(([-_a-zA-Z0-9_," ]+)\)/g;
      var f = formula.replace(sig,function(str,args){
        args = args.split(', ');
        sheet_id = args[0].slice(1,-1);
        row_id = args[1].slice(1,-1);
        col_id = args[2].slice(1,-1);
        var sheet = exh.es_data.sheets.get(sheet_id);
        row_idx = sheet.rows.indexOf(row_id) + 1;
        col_idx = sheet.cols.indexOf(col_id) + 1;
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
      cellreference: {
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

      sum: {
        method: function(addatives){
          var total = this.loopThroughNums(0,addatives,function(memo,item){
            memo += item * 1;
            return memo;
          });
          return total;
        },
        def: i18n.t("sum_def"),
        desc: i18n.t("sum_desc"),
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
        def: i18n.t("product_def"),
        desc: i18n.t("product_desc"),
      },
      
      avg: {
        method: function(args){
          var avg = this.loopThroughNums(0,args,function(memo,item){
            memo += item * 1;
            return memo;
          });
          avg = avg / args.length;
          return avg;
        },
        def: i18n.t("avg_def"),
        desc: i18n.t("avg_desc"),
      },

      abs: {
        method: function(num){
          return Math.abs(num);
        },
        def: i18n.t("abs_def"),
        desc: i18n.t("abs_desc"),
      },

      acos: {
        method: function(num){
          return Math.acos(num);
        },
        def: i18n.t("acos_def"),
        desc: i18n.t("acos_desc"),
      },

      asin: {
        method: function(num){
          return Math.asin(num);
        },
        def: i18n.t("asin_def"),
        desc: i18n.t("asin_desc"),
      },

      atan: {
        method: function(num){
          return Math.atan(num);
        },
        def: i18n.t("atan_def"),
        desc: i18n.t("atan_desc"),
      },

      atan2: {
        method: function(num){
          var y = num[0];
          var x = num[1];
          return Math.atan2(y, x);
        },
        def: i18n.t("atan2_def"),
        desc: i18n.t("atan2_desc"),
      },

      ceil: {
        method: function(num){
          return Math.ceil(num);
        },
        def: i18n.t("ceil_def"),
        desc: i18n.t("ceil_desc"),
      },

      cos: {
        method: function(num){
          return Math.cos(num);
        },
        def: i18n.t("cos_def"),
        desc: i18n.t("cos_desc"),
      },

      exp: {
        method: function(num){
          return Math.exp(num);
        },
        def: i18n.t("exp_def"),
        desc: i18n.t("exp_desc"),
      },

      floor: {
        method: function(num){
          return Math.floor(num);
        },
        def: i18n.t("floor_def"),
        desc: i18n.t("floor_desc"),
      },

      log: {
        method: function(num){
          return Math.log(num);
        },
        def: i18n.t("log_def"),
        desc: i18n.t("log_desc"),
      },

      pow: {
        method: function(num){
          var base = num[0];
          var exp = num[1];
          return Math.pow(base,exp);
        },
        def: i18n.t("pow_def"),
        desc: i18n.t("pow_desc"),
      },

      rand: {
        method: function(){
          return Math.random();
        },
      },

      random: {
        method: function(){ return rand(); },
        def: i18n.t("rand_def"),
        desc: i18n.t("rand_desc"),
      },

      sin: {
        method: function(num){
          return Math.sin(num);
        },
        def: i18n.t("sin_def"),
        desc: i18n.t("sin_desc"),
      },

      sqrt: {
        method: function(num){
          return Math.sqrt(num);
        },
        def: i18n.t("sqrt_def"),
        desc: i18n.t("sqrt_desc"),
      },

      tan: {
        method: function(num){
          return Math.tan(num);
        },
        def: i18n.t("tan_def"),
        desc: i18n.t("tan_desc"),
      },      
    }
  };
});