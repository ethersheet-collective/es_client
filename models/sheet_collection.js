if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

/*
  # Selection Collection
*/

var Backbone = require('backbone');
var Sheet= require('es_client/models/sheet');

var SheetCollection = module.exports = Backbone.Collection.extend({

  model: Sheet,

  initialize: function(o){
    o = o || {};
  }
});

});
