if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module) {

var $ = require('jquery');

var SheetCollection = require('es_client/models/sheet_collection');
var SelectionCollection = require('es_client/models/selection_collection');
var TableView = require('es_client/views/table');
var Socket = require('es_client/lib/socket');

var Ethersheet = module.exports = function(o) {
  if(!o.target) throw Error('el or target required');
  var es = this;
  
  this.data = {};
  this.data.selections = new SelectionCollection();
  this.data.sheet = new SheetCollection([o.sheet]);

  this.socket = new Socket(o.channel,this.data);

  $(function(){
    es.$el = $(o.target);
    es.table = new TableView({
      el: es.$el,
      sheet: es.data.sheet.first(),
      selections: es.data.selections
    }).render();
  });
};

});
