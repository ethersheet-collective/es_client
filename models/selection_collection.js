if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

/*
  # Selection Collection
*/

var ESCollection= require('./es_collection');
var Selection = require('./selection');

var SelectionCollection = module.exports = ESCollection.extend({

  model: Selection,

  initialize: function(o){
    o = o || {};
    
    var local =  o.local || new Selection();
    this.add(local);
    this.setLocal(local);
    this.send_enabled = true;
  },

  requestReplication: function(){
    var s = this.getLocal();
    this.send({
      type:'selection',
      action:'replicateSelection',
      params:[s.getData()]
    });
  },

  replicateSelection: function(data){
    /*if we don't already have the selection in our stores, this must be a new 
    * client in which case we should send them our selection object.  
    * The better way to do this would be to send the client our selection 
    * directly when a new client connects */
    if(!this.get(data.id)){
      this.enableSend();
      this.requestReplication();
      this.disableSend();
    }
    this.add(data);
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
