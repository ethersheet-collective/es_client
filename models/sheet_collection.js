if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module) {

/*
  # Selection Collection
*/

var _ = require('underscore');
var ESCollection= require('./es_collection');
var Sheet= require('./sheet');

var SheetCollection = module.exports = ESCollection.extend({

  model: Sheet,

  initialize: function(models,o){
    o = o || {};
    this.id = o.channel;
    this.send_enabled = true;
    this.share_db = o.share_db
    this.expressionHelpers = o.expressionHelpers;
    this.initializeShareDB();
  },

  initializeShareDB: function(){
    var defaults = {
      id:'foo',
      collection:[]
    };
    this.share_db.set([],defaults);
  },
  
  addSheet: function(o){
    o = o || {};
    o.expressionHelpers = this.expressionHelpers;;
    
    var pos = this.share_db.getLength('collection');
    this.share_db.insert(['collection'],pos,{});

    o.share_db = this.share_db.createContextAt(['collection',pos]);
    var sheet = new Sheet(o);
    
    sheet.setTitle('Sheet' + (pos * 1 + 1));
    
    this.add(sheet);

    this.send({
      id: this.id,
      type: 'sheets',
      action: 'addSheet',
      params:[sheet.getData()]
    },{
      id: this.id,
      type: 'sheets',
      action: 'deleteSheet',
      params:[sheet.id]
    });
  }


});

});
