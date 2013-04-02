if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module) {

var $ = require('jquery');

var config = require('es_client/config');
var Socket = require('es_client/lib/socket');
var Command = require('es_command');

// models
var UserCollection = require('es_client/models/user_collection');
var SheetCollection = require('es_client/models/sheet_collection');
var SelectionCollection = require('es_client/models/selection_collection');

// views
var TableView = require('es_client/views/table');
//var ExpressionEditorView = require('es_client/views/expression_editor');
var EthersheetContainerView = require('es_client/views/ethersheet_container');
var MenuView = require('es_client/views/menu');

var Ethersheet = module.exports = function(o) {
  if(!o.target) throw Error('el or target required');
 
  this.connection_handler = function(){};
  this.data = {};
  this.socket = null;

  this.initializeData(o);
  this.initializeSocket(o);
  this.initializeDisplay(o);
};

Ethersheet.prototype.initializeData = function(o){
  this.data.sheet = new SheetCollection([o.sheet]);
  this.data.selection = new SelectionCollection([],{sheet_collection: this.data.sheet});
  this.data.user = new UserCollection([],{selection_collection:this.data.selection});
  this.data.user.createCurrentUser(o.user);
  this.data.selection.createLocal({
    user_id:this.data.user.getCurrentUser().id,
    color:config.DEFAULT_LOCAL_SELECTION_COLOR
  });
};

Ethersheet.prototype.initializeSocket = function(o){
  var es = this;
  
  this.socket = new Socket(o.channel,this.data.user.getCurrentUser().id,o.socket);

  this.socket.onOpen(function(e){
    var current_user = es.data.user.getCurrentUser();
    es.data.user.replicateCurrentUser();
    es.data.user.requestReplicateCurrentUser();
    es.data.selection.requestReplication();
    es.connect();
  });

  this.socket.onMessage(function(e){
    var data_string = e.data;
    var c = new Command(data_string);
    var model = es.getModel(c.getDataType(),c.getDataId());
    model.disableSend();
    c.execute(model);
    model.enableSend();
  });

  this.bindDataToSocket();
};

Ethersheet.prototype.initializeDisplay = function(o){
  var es = this;
  $(function(){
    es.$el = $(o.target);
    es.ethersheet_container = new EthersheetContainerView({
      el: es.$el
    }).render();
    /*es.expression_editor = new ExpressionEditorView({
      el: $(expression_editor_container, es.$el),
      sheet: es.data.sheet.first(),
      selections: es.data.selection.getLocal(),
    }).render();*/
    es.table = new TableView({
      el: $('#es-table-container', es.$el),
      sheet: es.data.sheet.first(),
      selections: es.data.selection
    }).render();
    es.menu = new MenuView({
      el: $('#es-menu-container', es.$el),
      sheet: es.data.sheet.first(),
      selections: es.data.selection
    }).render();
  });
};


Ethersheet.prototype.onConnect = function(handler){
  this.connection_handler = handler;
};

Ethersheet.prototype.connect = function(){
  this.connection_handler();
};

Ethersheet.prototype.getModel = function(type,id){
  var collection = this.data[type];
  if(!collection) return false
  if(!id) return collection;
  return collection.get(id);
};


Ethersheet.prototype.bindDataToSocket = function(){
  var es = this;
  for(var type in this.data){
    this.data[type].on('send',function(msg){
      es.socket.send(Command.serialize(msg));
    });
  }
};

});
