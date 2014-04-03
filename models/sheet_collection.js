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
  renameSheet: function(id,new_name){
    var sheet = this.get(id);
    var old_name = sheet.meta.title;
    sheet.meta.title = new_name;
    this.trigger('rename_sheet',{});
    this.send({
      id: this.id,
      type: 'sheets',
      action: 'renameSheet',
      params: [sheet.id,new_name] 
    },{
      id: this.id,
      type: 'sheets',
      action: 'renameSheet',
      params: [sheet.id,old_name] 
    });
  },
  deleteSheet: function(id){
    var sheet = this.get(id);
    console.log(sheet);
    var sheet_data = sheet.getData();
    this.send({
      id: this.id,
      type: 'sheets',
      action: 'deleteSheet',
      params:[sheet.id]
    },{
      id: this.id,
      type: 'sheets',
      action: 'addSheet',
      params:[sheet_data]
    });
    sheet.destroy();
  },
  addSheet: function(o){
    var sheet = new Sheet(o);
    sheet.meta.title = 'Sheet' + (this.length * 1 + 1);
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
