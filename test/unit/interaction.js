if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var expect = require('chai').expect;
var should = require('chai').should();
var $ = require('jquery');

var Sheet = require('es_client/models/sheet');
var SelectionCollection = require('es_client/models/selection_collection');
var TableView = require('es_client/views/table');
var ES = require('es_client/config');

// setup dom attachment point
var $container = $('<div id="ethersheet-container" style="display:none;"></div').appendTo('body');

describe('TableView Interaction', function(){

  var table, $el, sheet, user, selections;

  var initializeTable = function(){
    $container.empty()
    $el = $('<div id="ethersheet"></div>').appendTo($container);
    sheet = new Sheet();
    
    selections = new SelectionCollection();

    table = new TableView({
      el: $el,
      sheet: sheet,
      selections: selections
    });
    table.render();
  }

  describe("when a cell is clicked", function(){
    before(function(){
      initializeTable();
      $('.es-table-cell').first().click();
    });

    it("should create a selection", function(){
      var cells = selections.getLocal().getCells();
      cells.length.should.equal(1);
      cells[0].col_id.should.equal(sheet.colAt(0));
      cells[0].row_id.should.equal(sheet.rowAt(0));
      cells[0].sheet_id.should.equal(sheet.id);
    });
  });
});

})
