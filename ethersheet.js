if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var $ = require('jquery');

var Sheet = require('es_client/models/sheet');
var SelectionCollection = require('es_client/models/selection_collection');
var TableView = require('es_client/views/table');

Ethersheet = function(o) {
  if(!o.target) throw Error('el or target required');

  var es = this;
  this.sheet = new Sheet();
  this.selections = new SelectionCollection();

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
