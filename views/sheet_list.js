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
    'click #es-import-csv': 'importCSV',
    'click #rename-sheet': 'editSheet',
    'submit #sheet_edit_form': 'renameSheet',
    'click #delete-sheet': 'deleteSheet',
    'click span#sheet_name': 'onSheetSelection',
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
      'add': 'render',
      'rename_sheet': 'render',
      'remove': 'onSheetRemoved'
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
  },
  importCSV:function(){
    var current_sheet_id = this.getUsers().getCurrentUser().getCurrentSheetId();
    $('#es-modal-box').html(t.import_dialog({sheet_id: current_sheet_id}));
    $('#es-modal-overlay').show();
  },
  editSheet: function(e){
    $("#sheet_name").hide();
    $("#sheet_edit_form").show();
  },
  renameSheet: function(e){
    e.preventDefault();
    var sheet_id = $(e.currentTarget).children('#sheet-id').val();
    var sheet_name = $(e.currentTarget).children('#sheet-name').val();
    console.log('renaming',sheet_id,'to',sheet_name);
    this.getSheets().renameSheet(sheet_id,sheet_name);
  },
  deleteSheet: function(e){
    var confirm_delete = "Warning: This will permanently delete the sheet, are you sure you wish to continue?";
    var sheet_id = $(e.currentTarget).data('sheet-id');
    console.log(sheet_id);
    if(confirm(confirm_delete)){
      this.getSheets().deleteSheet(sheet_id);
    }
  },
  onSheetRemoved: function(){
    this.render();
    this.getUsers().getCurrentUser().setCurrentSheetId(this.getSheets().first().id);
  },
});

});

