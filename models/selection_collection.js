if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

/*
  # Selection Collection
*/

var ESCollection= require('./es_collection');
var Selection = require('./selection');
var SheetCollection = require('./sheet_collection');

var SelectionCollection = module.exports = ESCollection.extend({

  model: Selection,

  initialize: function(models,o){
    o = o || {};
    this.sheet_collection = o.sheet_collection || new SheetCollection();
    this.send_enabled = true;
    this.local = null;
  },

  findByUserId:function(user_id){
    return this.find(function(selection){
      return selection.user_id === user_id;
    });
  },

// ## Local Selection

  createLocal: function(o){
    var local =  this.getLocal() || new Selection(o);
    this.setLocal(local);
  },

  setLocal: function(selection){
    this.unsetLocal();
    if(!this.get(selection.id)) this.add(selection);
    this.local = selection;
  },

  unsetLocal: function(){
    if(!this.local) return;
    this.local.off(null,null,this);
    this.local = null;
  },

  getLocal: function(){
    return this.local;
  },

// ## Replication

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
    this.get(data.id).addCells(data.cells);
  },

// ## Sheet Collection

  getSheet: function(sheet_id){
    return this.sheet_collection.get(sheet_id);
  }
});

});
