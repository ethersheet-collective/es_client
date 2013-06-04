
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
    'click #es-modal-close': 'closeModal',
    'click .es-sidebar-toggle': 'toggleSidebar',
  },
  render: function(){
    $(this.el).html(t.es_container);
    this.$expression = $("#es-expression-editor-container",this.$el);
    this.$table = $("#es-table-container",this.$el);
    this.$menu = $("#es-menu-container",this.$el);
    this.$panel_0 = $("#es-panel-0", this.$el);
    this.$panel_1 = $("#es-panel-1", this.$el);
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
  },

  toggleSidebar: function(){
    var speed = 400;
    if(this.$panel_0.width() == 0){
      this.$menu.animate({'right':'0px'},speed);
      this.$panel_0.animate({'width':'200px'},speed);
      this.$panel_1.animate({'margin-left':'200px'},speed);
    }else{
      this.$menu.animate({'right':'200px'},speed);
      this.$panel_0.animate({'width':'0'},speed);
      this.$panel_1.animate({'margin-left':'0'},speed);
    }
    
  }
});

});
