
if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){
  
/*
  #ExpressionEditorView

  An editor for cell expressions 

  ## References
  * Sheet

*/

var $ = require('jquery');
var _ = require('underscore');
var t = require('es_client/templates');
var RefBinder = require('ref-binder');
var View = require('backbone').View;

var ExpressionEditor = module.exports = View.extend({
  initialize: function(o){
    this.models = new RefBinder(this);
  },
  render: function(){
    console.log('rendor!');
    var $el = this._$el = $('<div class="ExpressionEditorContainer">');
    $el.html(t.expression_editor);
    this.swapElement();
    return this;
  },
  swapElement: function(){
    this.$el.html(this._$el);
  },
});

});
