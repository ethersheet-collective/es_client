if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module) {

/*
  # Selection Collection
*/

var _ = require('underscore');
var ESCollection= require('./es_collection');
var Sheet= require('./sheet');
var uid = require('../helpers/uid');

var SheetCollection = module.exports = ESCollection.extend({

  model: Sheet,

  initialize: function(models,o){
    o = o || {};
    this.send_enabled = true;
    this.share_db = o.share_db;
    this.expressionHelpers = o.expressionHelpers;
  },

  initializeShareDB: function(){
    var self = this;
    if(this.share_db.get('collection')){
      this.id = this.share_db.get('id');
      this.share_db.get('collection').forEach(function(sheet_data,index){
        var context = self.share_db.createContextAt(['collection',index]);
        var sheet = new Sheet({
          share_db:context,
          expressionHelpers:self.expressionHelpers
        });
        self.add(sheet);
      });
    } else {
      this.id = uid();
      var defaults = {
        id:this.id,
        collection:[]
      };
      this.share_db.set([],defaults);
      this.addSheet();
    }
  },
  
  addSheet: function(o){
    o = o || {};
    o.expressionHelpers = this.expressionHelpers;
    
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
