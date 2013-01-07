if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

/*
  # Selection Collection
*/

var Backbone = require('backbone');
var Selection = require('es_client/models/selection');

var SelectionCollection = module.exports = Backbone.Collection.extend({

  model: Selection,

  initialize: function(o){
    o = o || {};
    
    var local =  o.local || new Selection();
    this.add(local);
    this.setLocal(local);
  },

  setLocal: function(selection){
    this.unsetLocal();
    this.local = selection;
  },

  unsetLocal: function(){
    if(!this.local) return;
    this.local.off(null,null,this);
    this.local = undefined;
  },

  getLocal: function(){
    return this.local;
  }
});

});
