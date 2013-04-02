
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
    'keyup .ExpressionEditor input': 'inputKeypress',
    'keydown': 'inputKeydown',
    'blur .ExpressionEditor input': 'inputOnBlur',
    'focus .ExpressionEditor input': 'inputOnFocus'
  },

  initialize: function(o){
    this.models = new RefBinder(this);
    this.setSheet(o.sheet || null);
    this.setSelections(o.selections || null);
  },

  render: function(){
    var $el = this._$el = $('<div class="ExpressionEditorContainer">');
    $el.html(t.expression_editor);
    this.swapElement();
    return this;
  },

  swapElement: function(){
    this.$el.html(this._$el);
  },

  onAddCell: function(cell){
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

  inputKeydown: function(e){
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code == 13 || code == 9) return false;
  },

  inputKeypress: function(e){
    $input = $(e.currentTarget)
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code == 13){
      this.handleEnterKeypress();
      return false;
    };
    if(code == 9){
      this.handleTabKeypress();
      return false;
    };
    this.getSheet().updateCell(this.currentCell.row_id, this.currentCell.col_id, $input.val()); 
  },

  handleEnterKeypress: function(){
    this.getSheet().commitCell(this.currentCell.row_id, this.currentCell.col_id);
    this.moveSelection(1,0);
  },

  handleTabKeypress: function(){
    this.getSheet().commitCell(this.currentCell.row_id, this.currentCell.col_id);
    this.moveSelection(0,1);
  },

  moveSelection: function(row_offset, col_offset){
    var selection = this.getSelections();
    var old_cell = selection.getCells()[0];
    var rows = this.getSheet().rows;
    var cols = this.getSheet().cols;
    var new_col_idx = _.indexOf(cols,old_cell.col_id) + col_offset;
    var new_col = cols[new_col_idx];
    var new_row_idx = _.indexOf(rows,old_cell.row_id) + row_offset;
    var new_row = rows[new_row_idx];
    selection.clear();
    selection.addCell(this.getSheet().id, new_row, new_col);

  },

  inputOnBlur: function(e){
    this.getSheet().commitCell(this.currentCell.row_id,this.currentCell.col_id);
  },

  inputOnFocus: function(e){
  },

  onUpdateCell: function(cell){
    var s = this.getSelections().getCells()[0];
    if(!s || cell.row_id != s.row_id || cell.col_id != s.col_id) return;
    var $form = $('.ExpressionEditor input');
    $form.val(this.getSheet().getDisplayValue(cell.row_id, cell.col_id));
  }
});

});
