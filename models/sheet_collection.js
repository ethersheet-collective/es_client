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

  initialize: function(o){
    o = o || {};
    this.send_enabled = true;
  },
  
  addSheet: function(o){
    console.log('adding sheet', o);
    var sheet = new Sheet(o);
    this.add(sheet);
    console.log('thissheet', sheet);
    this.send({
      type: 'sheet',
      action: 'addSheet',
      params:[sheet.getData()]
    },{
      type: 'sheet',
      action: 'deleteSheet',
      params:[sheet.id]
    });
  },


});

});
