if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){

var $ = require('jquery');
var t = require('../templates');
var RefBinder = require('ref-binder');
var View = require('backbone').View;
var _ = require('underscore');

var SheetListView = module.exports = View.extend({

  events: {
    'click #es-add-sheet-button': 'onAddSheetClick',
    'click .es-menu-button': 'onSheetSelection'
  },

  initialize: function(o){
    this.models = new RefBinder(this);
    this.data = o.data;
    this.$el = o.el
    this.setSheets(o.data.sheets || null);
    this.setUsers(o.data.users || null);
  },

  getSheets: function(){
    return this.models.get('sheets');
  },

  setSheets: function(sheets){
    this.models.set('sheets', sheets,{
      'add': 'render'
    });
  },

  getUsers: function(){
    return this.models.get('users');
  },

  setUsers: function(users){
    this.models.set('users', users);
  },

  render: function(){
    this.$el.empty();
    var current_sheet_id = this.getUsers().getCurrentUser().getCurrentSheetId();
    this.$el.html(t.sheet_list({sheets:this.getSheets(), current_sheet_id:current_sheet_id}));
    $('#' + current_sheet_id).addClass('active');
  },

  onAddSheetClick: function(e){
    this.getSheets().addSheet();
  },
  onSheetSelection: function(e){
    $el = $(e.currentTarget);
    $('.es-menu-button').removeClass('active');
    $el.addClass('active');
    this.getUsers().getCurrentUser().setCurrentSheetId($el.attr('id'));
  }
});

});

