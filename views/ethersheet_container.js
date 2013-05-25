
if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){
  
/*
  #Ethersheet Container View

  Container template for all other ethersheet views.

*/

var $ = require('jquery');
var t = require('../templates');
var RefBinder = require('ref-binder');
var View = require('backbone').View;

var EthersheetContainer = module.exports = View.extend({
  initialize: function(){
    this.$expression = null;
    this.$table = null;
    this.is_rendered = false;
    $(window).resize(this.resize.bind(this));
  },
  events: {
    'click #es-modal-close': 'closeModal'
  },
  render: function(){
    $(this.el).html(t.es_container);
    this.$expression = $("#es-expression-editor-container",this.$el);
    this.$table = $("#es-table-container",this.$el);
    this.$menu = $("#es-menu-container",this.$el);
    this.is_rendered = true;
    this.resize();
    return this;
  },

  resize: function(){
    if(!this.is_rendered) return;
    var table_height = this.$el.innerHeight() - this.$expression.outerHeight(true);
    this.$table.height(table_height);
  },

  closeModal: function(){
    $("#es-modal-overlay").hide()
  }
});

});
