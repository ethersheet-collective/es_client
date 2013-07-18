if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

/*

  # User

*/

var ESModel = require('./es_model');
var uid = require('../helpers/uid');

var User = module.exports = ESModel.extend({
  initialize: function(o){
    o = o || {};
    this.id = o.id||uid();
    this.current_sheet_id = null;
  },

  getData:function(){
    return {
      id: this.id
    }
  },

  getCurrentSheetId:function(){
    return this.current_sheet_id;
  },

  setCurrentSheetId:function(sheet_id){
    this.current_sheet_id = sheet_id;
    this.trigger('change_current_sheet_id');
  },

  onDestroy:function(){
    if(!this.collection) return;
    var selection = this.collection.selection_collection.findByUserId(this.id);
    selection.destroy();
  }


});

});
