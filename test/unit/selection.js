if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var SelectionCollection = require('es_client/models/selection_collection');
var Sheet = require('es_client/models/sheet');
var config = require('es_client/config');
var expect = require('chai').expect;
var should = require('chai').should();
var Backbone = require('backbone');
var SheetCollection = require('es_client/models/sheet_collection');

// stub out server calls
Backbone.sync = function(){};

describe('Selection', function(){
  var selection, sheet, col_id,row_id, events;

  var initializeSelection = function(){
    events = [];
    sheets = new SheetCollection();
    selections = new SelectionCollection({sheet_collection:sheets});
    sheet = new Sheet();
    selection = selections.getLocal();
    sheets.add(sheet);
    selections.add(selection);
    col_id = sheet.colAt(0);
    row_id = sheet.rowAt(0);
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
      selection.addCell(sheet.id,row_id,col_id);
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
      selection.addCell(sheet.id,row_id,col_id);
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
      events.length.should.equal(2);
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
      selection.addCell(sheet.id,row_id,col_id);
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
      selection.addCell(sheet.id,row_id,col_id);
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

  describe('Replication',function(){
    describe('requestReplication',function(){
      it('should send a copy of the local selection',function(done){
        initializeSelection();
        selection.addCell(sheet.id,'123','abc');
        var test_msg = {
          type: 'selection',
          action: 'replicateSelection',
          params:[selection.getData()]
        }
        selections.on('send',function(msg){
          expect(msg).to.deep.equal(test_msg);
          done();
        });
        selections.requestReplication();

      });
    })

    describe('replicateSelection',function(){
      var rep_data, rep_selection;

      beforeEach(function(){
        initializeSelection();
        rep_data = {id:'test_selection',color:'000000'};
        selections.replicateSelection(rep_data);
        rep_selection = selections.get('test_selection')
      });

      it('should create a copy of the selection',function(){
        expect(rep_selection.id).to.equal(rep_data.id);
      });

      it('replicated data should be correct',function(){
        rep_selection.getColor().should.equal('000000');
      });

    });
  });
});

});
