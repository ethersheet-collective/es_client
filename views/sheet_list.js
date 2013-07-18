if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){

var $ = require('jquery');
var t = require('../templates');
var RefBinder = require('ref-binder');
var View = require('backbone').View;
var _ = require('underscore');

var SheetListView = module.exports = View.extend({

  initialize: function(o){
    this.models = new RefBinder(this);
    this.data = o.data;
    this.$el = o.el
    this.setSheets(o.data.sheets || null);
  },

  getSheets: function(){
    return this.models.get('sheets');
  },

  setSheets: function(sheets){
    this.models.set('sheets', sheets,{
      'add': 'render'
    });
  },

  render: function(){
    this.$el.empty();
    this.$el.html(t.sheet_list({sheets:this.getSheets()}));
  }
});

});

