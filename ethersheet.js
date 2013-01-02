if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var $ = require('jquery');

var Sheet = require('es_client/models/sheet');
var SelectionCollection = require('es_client/models/selection_collection');
var TableView = require('es_client/views/table');
var Socket = require('es_client/lib/socket');
var esCommand = require('es_command');

Ethersheet = function(o) {
  if(!o.target) throw Error('el or target required');
  
  
  this.data = {};
  this.data.selections = new SelectionCollection();
  this.data.sheet = new Sheet({
    id:o.sheet_id,
    selections: this.data.selections
  });

  this.socket = new Socket(o.sheet_id,this.data);

  $(function(){
    es.$el = $(o.target);
    es.table = new TableView({
      el: es.$el,
      sheet: es.data.sheet,
      selections: es.data.selections
    }).render();
  });
};

return Ethersheet;

});
