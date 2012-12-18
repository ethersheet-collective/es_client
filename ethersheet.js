if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var $ = require('jquery');

var Sheet = require('es_client/models/sheet');
var SelectionCollection = require('es_client/models/selection_collection');
var TableView = require('es_client/views/table');
var Socket = require('es_client/lib/socket');

Ethersheet = function(o) {
  if(!o.target) throw Error('el or target required');

  var es = this;
  this.socket = new Socket(o.sheet_id);
  this.sheet = new Sheet({id:o.sheet_id, socket:this.socket});
  this.selections = new SelectionCollection({socket:this.socket});

  $(function(){
    es.$el = $(o.target);
    es.table = new TableView({
      el: es.$el,
      sheet: es.sheet,
      selections: es.selections
    }).render();
  });
}

return Ethersheet;

});
