
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
  events: {
    'keypress .ExpressionEditor input': 'inputKeypress'
  },

  initialize: function(o){
    this.models = new RefBinder(this);
    this.setSheet(o.sheet || null);
    this.setSelections(o.selections || null);
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

  onAddCell: function(cell){
    console.log('click', cell);
    var $form = $('.ExpressionEditor input');
    $form.val(this.getSheet().getDisplayFormula(cell.row_id,cell.col_id));

  },

  setSheet: function(sheet){
    this.models.set('sheet',sheet,{});
  },

  getSheet: function(){
    return this.models.get('sheet');
  },
  setSelections: function(selections){
    this.models.set('selections',selections,{
      'add_cell': 'onAddCell',
      'clear': 'onClear'
    }); 
  },
  getSelections: function(){
    return this.models.get('selections');
  },
  inputKeypress: function(){
    console.log('keypress');
  }
});

});
