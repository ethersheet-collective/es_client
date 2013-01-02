if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

/*
  # Selection Collection
*/

var Backbone = require('backbone');
var Sheet= require('es_client/models/sheet');

return Backbone.Collection.extend({

  model: Sheet,

  initialize: function(o){
    o = o || {};
  }
});

});
