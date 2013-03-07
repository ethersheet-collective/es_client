if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

/*
  # Selection Collection
*/

var Backbone = require('backbone');
var Sheet= require('es_client/models/sheet');
var ex = require('es_client/vendor/es_expression'); //sets a global variable called expression
var parser = ex || es_expression; //setting things up incase we are running in node mode
var ExpressionHelpers = require('es_client/lib/expression_helpers');

var SheetCollection = module.exports = Backbone.Collection.extend({

  model: Sheet,

  initialize: function(o){
    o = o || {};
    this.expressionHelpers = new ExpressionHelpers(this);
    this.parser = parser;
    this.parser.yy = this.expressionHelpers;
  },
  setParserSheet: function(sheet){
    this.expressionHelpers.setSheet(sheet);
  }
});

});
