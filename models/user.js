if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

/*

  # User

*/

var ESModel = require('./es_model');
var uid = require('es_client/helpers/uid');

var User = module.exports = ESModel.extend({
  initialize: function(o){
    o = o || {};
    this.id = o.id||uid();
  },

  getData:function(){
    return {
      id: this.id
    }
  },

  onDestroy:function(){
    if(!this.collection) return;
    var selection = this.collection.selection_collection.findByUserId(this.id);
    selection.destroy();
  }


});

});
