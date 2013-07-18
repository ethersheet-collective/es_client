if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

/*
  # Selection Collection
*/

var Backbone = require('backbone');
var ESCollection= require('./es_collection');
var Sheet= require('./sheet');

var SheetCollection = module.exports = ESCollection.extend({

  model: Sheet,

  initialize: function(models,o){
    o = o || {};
    this.id = o.channel;
    this.send_enabled = true;
  },

  
  addSheet: function(o){
    var sheet = new Sheet(o);
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
  },


});

});
