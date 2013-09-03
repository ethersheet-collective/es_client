if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var expect = require('chai').expect;
var should = require('chai').should();
var connect = require('es_client/lib/share_db').connect;
var disconnect = require('es_client/lib/share_db').disconnect;
var uid = require('es_client/helpers/uid');

// stub out server calls
Backbone.sync = function(){};

describe('Selection', function(){
  var data, selections, selection, sheet, col_id,row_id, events;

  function initializeSelection(done){
    if(data){
      return resetSelection(function(){
        initializeSelection(done);
      });
    }

    var o = {id: 'test-'+uid()};
    connect(o, function(err,test_data){
      data =test_data;
      events = [];

      sheet = data.sheets.first();
      col_id = sheet.colAt(0);
      row_id = sheet.rowAt(0);

      selections = data.selections;
      selection = selections.getLocal();
      selection.on('all',function(){
        events.push({
          name: arguments[0],
          args: Array.prototype.slice.call(arguments,1)
        });
      });
      
      done();
    });
  };
  
  function resetSelection(done){
    if(!data) return done();
    disconnect(data,function(err){
      data = undefined;
      sheet = undefined;
      selection = undefined;
      selections = undefined;
      events = undefined;
      done(err);
    });
  }

  function clearEvents(){
    events = [];
  };


  beforeEach(function(done){
    initializeSelection(done);
  });

  afterEach(function(done){
    resetSelection(done);
  });

  describe('clear selection', function(){
    beforeEach(function(){
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
    beforeEach(function(){
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

  describe('add row', function(){
    beforeEach(function(){
      sheet.updateCell('0','0','test');
      sheet.commitCell('0','0');
      sheet.updateCell('0','1','test');
      sheet.commitCell('0','1');
      clearEvents();
      selection.addRow(sheet.id,row_id);
    });

    it('should increase the size of the selection',function(){
      selection.getCells().length.should.equal(sheet.colIds().length);
    });

    it('should emit an add_row event and a send event', function(){
      events.length.should.equal(2);
      events.pop().name.should.equal('send');
      events.pop().name.should.equal('select_row');
    });
  });
  
  describe('add column', function(){
    beforeEach(function(){
      selection.addColumn(sheet.id,col_id);
    });
    it('should increase the size of the selection',function(){
      selection.getCells().length.should.equal(sheet.rowIds().length);
    });
    it('should emit an add_cell event for each cell in the row', function(){
      events.length.should.equal(2);
      events.pop().name.should.equal('send');
      events.pop().name.should.equal('select_col');
    });
  });

  describe('add formatting',function(){
    beforeEach(function(){
      sheet.updateCell(row_id,col_id,'test');
      selection.addCell(sheet.id,row_id,col_id);
      clearEvents();
      selection.addFormat('bg-red');
    });
    it('should emit an add_format event', function(){
      events.length.should.equal(3);
      events[0].name.should.equal('add_format');
    });
    it('should emit a send event', function(){
      events.length.should.equal(3);
      events[1].name.should.equal('send');
    });
  }); 

  describe('update cell', function(){
    beforeEach(function(){
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
