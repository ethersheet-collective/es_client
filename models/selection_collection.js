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

  addSelection: function(data){
    this.add(data);
    var selection = this.get(data.id)
    this.send({
      type:'selection',
      action:'addSelection',
      params:[selection.getData()]
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
  
  replicateSelection: function(id){
    var selection = this.get(id);
    if(!selection) return;
    this.alwaysSend({
      type:'selection',
      action:'addSelection',
      params:[selection.getData()]
    });
  },

  replicateLocalSelection: function(){
    var selection = this.getLocal();
    this.replicateSelection(selection.id);
  },

  requestReplicateLocalSelection: function(){
    this.alwaysSend({
      type:'selection',
      action:'replicateLocalSelection'
    });
  },

// ## Sheet Collection

  getSheet: function(sheet_id){
    return this.sheet_collection.get(sheet_id);
  }
});

});
