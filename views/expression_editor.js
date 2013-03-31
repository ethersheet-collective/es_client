
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
    'keyup.ExpressionEditor input': 'inputKeypress',
    'blur .ExpressionEditor input': 'inputOnBlur',
    'focus .ExpressionEditor input': 'inputOnFocus'
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
    this.currentCell = cell;
    $form.val(this.getSheet().getDisplayFormula(cell.row_id,cell.col_id));

  },

  setSheet: function(sheet){
    this.models.set('sheet',sheet,{
      'update_cell': 'onUpdateCell',
    });
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

  inputKeypress: function(e){
    $input = $(e.currentTarget)
    console.log('keypress!', $input.val());
    this.getSheet().updateCell(this.currentCell.row_id, this.currentCell.col_id, $input.val()); 
  },

  inputOnBlur: function(e){
    console.log('blur');
  },

  inputOnFocus: function(e){
    console.log('focus');
  },

  onUpdateCell: function(cell){
    var $form = $('.ExpressionEditor input');
    console.log(this.getSheet().getDisplayValue(cell.row_id, cell.col_id));
    $form.val(this.getSheet().getDisplayValue(cell.row_id, cell.col_id));
  }
});

});
