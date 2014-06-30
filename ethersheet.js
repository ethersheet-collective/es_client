if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module) {

var $ = require('jquery');

var config = require('./config');
var Socket = require('./lib/socket');
var Command = require('es_command');
var UndoQ = require('./lib/undo');

// models
var UserCollection = require('./models/user_collection');
var SheetCollection = require('./models/sheet_collection');
var SelectionCollection = require('./models/selection_collection');

// views
var TableView = require('./views/table');
var ExpressionEditorView = require('./views/expression_editor');
var EthersheetContainerView = require('./views/ethersheet_container');
var FunctionMenuView = require('./views/function_menu');
var HistoryView = require('./views/history');
var SheetListView = require('./views/sheet_list');
var initializeExpressionHelpers = require('./lib/expression_helpers');

// inputs
var keyboardEvents = require('./lib/keyboard');

var Ethersheet = module.exports = function(o) {
  if(!o.target) throw Error('el or target required');
 
  this.connection_handler = function(){};
  this.data = {};
  this.socket = null;
  this.undoQ = new UndoQ();
  this.keyboard = keyboardEvents();
  this.expressionHelpers = initializeExpressionHelpers(this.data);
  this.initializeData(o);
  this.initializeSocket(o);
  this.initializeDisplay(o);
  this.initializeCommands(o);

};

Ethersheet.prototype.initializeData = function(o){
  this.data.sheets = new SheetCollection(o.sheets, o);

  this.data.sheets.each(function(sheet){
    sheet.setExpressionHelper(this.expressionHelpers);
  }, this);

  this.data.selections = new SelectionCollection([],{sheet_collection: this.data.sheets});
  this.data.users = new UserCollection([],{selection_collection:this.data.selections});
  this.data.users.createCurrentUser(o.user);
  this.data.undo_stack = this.undoQ;
  this.data.current_user_id = this.data.users.getCurrentUser().id;

  this.data.users
    .getCurrentUser()
    .setCurrentSheetId(this.data.sheets.first().id);
  this.data.selections.createLocal({
    user_id:this.data.users.getCurrentUser().id,
    color:config.DEFAULT_LOCAL_SELECTION_COLOR
  });
};

Ethersheet.prototype.initializeSocket = function(o){
  var es = this;
  
  this.socket = new Socket(o.channel,this.data.users.getCurrentUser().id,o.socket);

  this.socket.onOpen(function(e){
    es.data.users.replicateCurrentUser();
    es.data.users.requestReplicateCurrentUser();
    es.data.selections.replicateLocalSelection();
    es.data.selections.requestReplicateLocalSelection();
    es.connect();
  });

  this.socket.onMessage(function(e){
    var data_string = e.data;
    var c = new Command(data_string);
    es.executeCommand(c);
  });

  this.bindDataToSocket();
};

Ethersheet.prototype.initializeDisplay = function(o){
  var es = this;
  $(function(){
    es.$el = $(o.target);
    es.ethersheet_container = new EthersheetContainerView({
      el: es.$el,
      data: es.data
    }).render();
    es.expression_editor = new ExpressionEditorView({
      el: $('#es-expression-editor-container', es.$el),
      data: es.data,
    }).render();
    es.table = new TableView({
      el: $('#es-table-container', es.$el),
      data: es.data
    }).render();
    es.menu = new FunctionMenuView({
      el: $('#es-function-menu-container', es.$el),
      data: es.data,
    }).render();
    es.history = new HistoryView({
      el: $('#es-activity-menu-container', es.$el),
      data: es.data
    }).render();
    es.sheet_list = new SheetListView({
      el: $('#es-sheet-menu-container', es.$el),
      data: es.data
    }).render();

    $(".i18n").i18n();
  });
};

Ethersheet.prototype.initializeCommands = function(o){
  var es = this;
  this.keyboard.on('meta_90',this.undoCommand.bind(this));
  this.keyboard.on('shift_meta_90',this.redoCommand.bind(this));

};

Ethersheet.prototype.onConnect = function(handler){
  this.connection_handler = handler;
};

Ethersheet.prototype.connect = function(){
  this.connection_handler();
};

Ethersheet.prototype.executeCommand = function(c){
  var model = this.getModel(c.getDataType(),c.getDataId());
  model.disableSend();
  c.execute(model);
  model.enableSend();
};

Ethersheet.prototype.sendCommand = function(c){
  if(c.getSerializedMessage){
    this.socket.send(c.getSerializedMessage());
  } else {
    this.socket.send(Command.serialize(c));
  }
};

Ethersheet.prototype.undoCommand = function(){
  var msg = this.undoQ.undo();
  if(!msg) return;
  var c = new Command(msg);
  this.executeCommand(c);
  this.sendCommand(c);
};

Ethersheet.prototype.redoCommand = function(){
  var msg = this.undoQ.do();
  if(!msg) return;
  var c = new Command(msg);
  this.executeCommand(c);
  this.sendCommand(c);
};

Ethersheet.prototype.getModel = function(type,id){
  var collection = this.data[type];
  if(collection){
    return collection;
  } else {
    collection = this.data[this.pluralizeType(type)];
  }
  if(!collection) return false;
  if(!id) return collection;
  return collection.get(id);
};

Ethersheet.prototype.pluralizeType = function(type){
  if (type == 'user')       return 'users';
  if (type == 'selection')  return 'selections';
  if (type == 'sheet')      return 'sheets';
  return type;
};

Ethersheet.prototype.bindDataToSocket = function(){
  var es = this;
  for(var type in this.data){
    if(!(_.isFunction(this.data[type].on))){
      continue;
    }
    this.data[type].on('send',function(do_cmd,undo_cmd){
      es.sendCommand(do_cmd);

      if(undo_cmd){
        es.undoQ.push(do_cmd,undo_cmd);
      }
    });
  }
};

});
