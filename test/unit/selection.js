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
  var selections, selection, sheet, col_id,row_id, events;

  var initializeSelection = function(){
    events = [];
    
    sheets = new SheetCollection();
    sheet = new Sheet();
    sheets.add(sheet);
    
    selections = new SelectionCollection([],{sheet_collection:sheets});
    selections.createLocal();
    selection = selections.getLocal();
    
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
      clearEvents();
      selection.clear();
    });

    it('should be empty', function(){
      selection.getCells().length.should.equal(0);
    });
    
    it('should trigger a send event', function(){
      events[2].name.should.equal('send');
      events[2].args[0].action.should.equal('clear');
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

    it('should trigger a send event', function(){
      events[1].name.should.equal('send');
      events[1].args[0].params[0].should.equal(sheet.id);
      events[1].args[0].params[1].should.equal(row_id);
      events[1].args[0].params[2].should.equal(col_id);
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
      events.length.should.equal(3);
      events[0].name.should.equal('change');
    });
  });

  describe('Replication',function(){
    describe('replicateLocalSelection',function(){
      it('should send a copy of the local selection',function(done){
        initializeSelection();
        selection.addCell(sheet.id,'123','abc');
        var test_msg = {
          type: 'selection',
          action: 'addSelection',
          params:[selection.getData()]
        }
        selections.on('send',function(msg){
          expect(msg).to.deep.equal(test_msg);
          done();
        });
        selections.replicateLocalSelection();

      });
    })

    describe('addSelection',function(){
      var rep_data, rep_selection, send_msg;

      beforeEach(function(done){
        initializeSelection();
        rep_data = {
          id:'test_selection',
          color:'000000', 
          cells:[
            {sheet_id:sheet.id,row_id:'foo',col_id:'foo'}
          ]
        };

        selections.on('send',function(msg){
          send_msg = msg; 
          done();
        });
        selections.addSelection(rep_data);
      });
      
      it('should send a addSelection event',function(){
        rep_selection = selections.get('test_selection')
        var test_msg = {
          type: 'selection',
          action: 'addSelection',
          params:[rep_selection.getData()]
        }
        expect(send_msg).to.deep.equal(test_msg);
      });

      it('replicated data should be correct',function(done){
        rep_selection = selections.get('test_selection')
        expect(rep_selection.id).to.equal(rep_data.id);
        rep_selection.getColor().should.equal('000000');
        setTimeout(function(){
          rep_selection.getCells().should.not.be.empty;
          done();
        },0);
      });
      
    });
  });
});

});
