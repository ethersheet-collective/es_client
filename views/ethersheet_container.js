
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
  initialize: function(o){
    this.$expression = null;
    this.$table = null;
    this.$grid = null;
    this.is_rendered = false;
    this.models = new RefBinder(this);
    this.data = o.data;
    this.models.set('sheets', o.data.sheets);
    $(window).resize(this.resize.bind(this));
  },
  
  events: {
    'click #es-modal-close': 'closeModal',
    'click .es-sidebar-toggle': 'toggleSidebar',
  },
  
  render: function(){
    var title = this.models.get('sheets').id
    $(this.el).html(t.es_container({title: title}));
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
    var table_height = this.$el.innerHeight() - 70;
    this.$table.height(table_height);
  },

  closeModal: function(){
    $("#es-modal-overlay").hide()
  },

  toggleSidebar: function(e){
    var speed = 400;
    var $el = $(e.currentTarget);

    if($el.hasClass('active')){
      //close the panel
      $el.removeClass('active');
      this.$menu.animate({'right':'258px'},speed);
      this.$panel_0.animate({'width':'0'},speed, 'swing', function(){
        $("#es-panel-0").hide();
        $('menu-container').hide();
      });
      $('#es-panel-1').animate({'margin-left':'10px'},speed);
    }else{
      $('.es-sidebar-toggle').removeClass('active');
      $el.addClass('active');
      this.$panel_0.show();
      $('.menu-container').hide();
      var container = $el.attr('id').replace('icon', 'menu-container');
      $("#" + container).show();
      if(this.$panel_0.width() <= 0){
        this.$menu.animate({'right':'0px'},speed);
        this.$panel_0.animate({'width':'258px'},speed);
        this.$panel_1.animate({'margin-left':'265px'},speed);
      }
       
    }
    
  }
});

});
