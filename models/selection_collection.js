if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var Backbone = require('backbone');
var Selection = require('es_client/models/selection');

return Backbone.Collection.extend({
  initialize: function(o){
    o = o || {};
    this.setLocal(o.local || new Selection());
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
