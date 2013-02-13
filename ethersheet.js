if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module) {

var $ = require('jquery');

var UserCollection = require('es_client/models/user_collection');
var SheetCollection = require('es_client/models/sheet_collection');
var SelectionCollection = require('es_client/models/selection_collection');
var TableView = require('es_client/views/table');
var Socket = require('es_client/lib/socket');

var Ethersheet = module.exports = function(o) {
  if(!o.target) throw Error('el or target required');
  var es = this;
 
  this.connection_handler = function(){};
  this.data = {};

  this.data.sheet = new SheetCollection([o.sheet]);
  this.data.selection = new SelectionCollection([],{sheet_collection: this.data.sheet});
  this.data.user = new UserCollection();

  $(function(){
    es.$el = $(o.target);
    es.table = new TableView({
      el: es.$el,
      sheet: es.data.sheet.first(),
      selections: es.data.selection
    }).render();
    es.socket = new Socket(o.channel,es.data);
    es.socket.onOpen(function(){
      es.data.user.createCurrentUser(o.user);
      es.data.selection.createLocal();
      es.data.selection.requestReplication();
      es.connect();
    });
  });
};


Ethersheet.prototype.onConnect = function(handler){
  this.connection_handler = handler;
};

Ethersheet.prototype.connect = function(){
  this.connection_handler();
};

});
