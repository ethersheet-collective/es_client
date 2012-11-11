if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var Selection = require('es_client/models/selection');
var Sheet = require('es_client/models/sheet');
var config = require('es_client/config');
var expect = require('chai').expect;
var should = require('chai').should();
var Backbone = require('backbone');

// stub out server calls
Backbone.sync = function(){};

describe('Selection', function(){
  var selection, sheet, col_id,row_id, events, websocket;

  var initializeSelection = function(){
    events = [];
    selection = new Selection();
    websocket = { emit: function(){ } };
    sheet = new Sheet({socket: websocket});
    col_id = sheet.colAt(0),
    row_id = sheet.rowAt(0)
    selection.on('all',function(){
      events.push({
        name: arguments[0],
        args: Array.prototype.slice.call(arguments,1)
      });
    });
  };
  
  var clearEvents = function(){
    events = [];
  };
  describe('clear selection', function(){
    before(function(){
      initializeSelection();
      selection.addCell(sheet,row_id,col_id);
      selection.clear();
    });
    it('should be empty', function(){
      selection.getCells().length.should.equal(0);
      selection.getSheets().should.be.empty;
    });
  });
  describe('add cell',function(){

    before(function(){
      initializeSelection();
      selection.addCell(sheet,row_id,col_id);
    });

    it('should increase the size of the selection',function(){
      selection.getCells().length.should.equal(1);
    });

    it('should add a cell to the selection',function(){
      var cell = selection.getCells()[0];
      cell.sheet_id.should.equal(sheet.id);
      cell.col_id.should.equal(col_id);
      cell.row_id.should.equal(row_id);
    });

    it('should emit an add_cell event', function(){
      events.length.should.equal(1);
      events[0].name.should.equal('add_cell');
      var cell = events[0].args[0];
      cell.sheet_id.should.equal(sheet.id);
      cell.col_id.should.equal(col_id);
      cell.row_id.should.equal(row_id);
    });
  });
  
  describe('update cell', function(){
    before(function(){
      initializeSelection();
      selection.addCell(sheet,row_id,col_id);
      clearEvents();
      sheet.updateCell(row_id,col_id,10)
    });

    it('should emit change when a cell changes value',function(){
      events.length.should.equal(1);
      events[0].name.should.equal('change');
    })
  });

  describe('remove cell', function(){
    beforeEach(function(){
      initializeSelection();
      selection.addCell(sheet,row_id,col_id);
      clearEvents();
    });

    it('should emit change when it\'s column is removed',function(){
      sheet.deleteCol(col_id);
      events.length.should.equal(1);
      events[0].name.should.equal('change');
    });
    
    it('should emit change when it\'s row is removed',function(){
      sheet.deleteRow(row_id);
      events.length.should.equal(1);
      events[0].name.should.equal('change');
    });

    it('should emit change when it\'s sheet is removed',function(){
      sheet.destroy();
      events.length.should.equal(1);
      events[0].name.should.equal('change');
    });
  });
});

});
