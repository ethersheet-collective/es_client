if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var expect = require('chai').expect;
var should = require('chai').should();
var $ = require('jquery');

var Sheet = require('es_client/models/sheet');
var TableView = require('es_client/views/table');
var ES = require('es_client/config');

// setup dom attachment point
var $container = $('<div id="ethersheet-container" style="display:none;"></div').appendTo('body');

describe('TableView', function(){

  var table, $el, sheet;

  var initializeTable = function(){
    $container.empty()
    $el = $('<div id="ethersheet"></div>').appendTo($container);
    sheet = new Sheet();
    table = new TableView({
      el: $el,
      sheet: sheet
    });
    table.render();
  }

  describe('by default, it should create a blank 20x100 table display', function(){
    before(function(){
      initializeTable();
    });

    it('should render a table', function(){
      $('#ethersheet table').length.should.not.be.empty;
    });

    it('should have the right number of cells', function(){
      var expected_cell_count = ES.DEFAULT_ROW_COUNT * ES.DEFAULT_COL_COUNT;
      $('#ethersheet .table-cell').length.should.equal(expected_cell_count);
    });

    it('should have the right number of rows', function(){
      $('#ethersheet .table-row').length.should.equal(ES.DEFAULT_ROW_COUNT);
    });

    it('should have the right column headers', function(){
      $('#ethersheet .column-header').length.should.equal(ES.DEFAULT_COL_COUNT);
      $("#ethersheet .column-header").last().text().should.equal('T');
    });

    it('should have the right row headers', function(){
      $('#ethersheet .row-header').length.should.equal(ES.DEFAULT_ROW_COUNT)
      $("#ethersheet .row-header").last().text().should.equal('100');
    });
    it('should have empty cells', function(){
      $('td',$el).each(function(){
        $(this).text().should.equal('');
      });
    });
  });
  
  describe('should respond to sheet events', function(){
    var value, row_id, col_id;

    before(function(){
      initializeTable();
      value = 5;
      row_id = sheet.rowIds()[0];
      col_id = sheet.colIds()[0];
      sheet.updateCell(row_id,col_id,value);
    });

    it('should draw a cell when we update the sheet\'s cell value',function(){
      $('td',$el).first().text().should.equal(value.toString()); 
    });
  });
});

});
