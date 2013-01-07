if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

/*

  # User

  ## References
  * Selection

*/

var Backbone = require('backbone');
var uid = require('es_client/helpers/uid');
var Selection = require('es_client/models/selection');

var User = module.exports = Backbone.Model.extend({
  initialize: function(o){
    this.set({id: o.id || uid()}, {silent:true});
    this.selecion = this.setSelection(o.selection || new Selection());
  },
  setSelection: function(selection){
    this.unsetSelection();
    this.selection = selection;
  },
  unsetSelection: function(){
    if(!this.selection) return;
    this.selection.off(null,null,this);
    this.selection = null;
  },
  getSelection: function(){
    return this.selection;
  }
});

});
