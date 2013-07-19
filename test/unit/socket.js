if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var Ethersheet = require('es_client/ethersheet');
var SheetCollection = require('es_client/models/sheet_collection');
var Sheet = require('es_client/models/sheet');
var SelectionCollection = require('es_client/models/selection_collection');
var config = require('es_client/config');
var expect = require('chai').expect;
var should = require('chai').should();
var sinon = require('sinon');
var Socket = require('es_client/lib/socket');

var fake_websocket = {
  send: function(){}
};

describe('Socket', function(){
  var socket, selections, sheets, sheet;

  beforeEach(function(){
     es = new Ethersheet({
      target:'#ethersheet-container',
      channel:'test_channel',
      socket: fake_websocket,
      sheets: new SheetCollection([new Sheet()], 'test_channel'),
      user:{
        id: 'test_user'
      }
    });
    sheets = es.data.sheets; 
    sheets.add({});
    sheet = sheets.first();
    selections = es.data.selections; 
    socket = es.socket; 
    cell = {value:1,type:"number"};
  });

  it('should trigger data event when cell is updated', function(){
    var mock = sinon.mock(socket);
    mock.expects('send').withArgs(JSON.stringify({
      id: sheet.id,
      type: 'sheet',
      action:'updateCell', 
      params:[sheet.rowAt(0),sheet.colAt(0),{value:1,type:"number"}]
    }));

    sheet.updateCell(sheet.rowAt(0),sheet.colAt(0),1);
    mock.verify();
  });

  it('should not trigger data event when cell is committed', function(){
    var mock = sinon.mock(socket);

    sheet.disableSend();
    sheet.updateCell(sheet.rowAt(0),sheet.colAt(0),1);
    sheet.enableSend();
    sheet.commitCell(sheet.rowAt(0),sheet.colAt(0));
    mock.verify();
  });

  it('should trigger data event when column is added', function(){
    var mock = sinon.mock(socket);
    mock.expects('send').withArgs(JSON.stringify({
      id: sheet.id,
      type: 'sheet',
      action:'insertCol', 
      params:[0, 'new1']
    }));
    sheet.insertCol(0, 'new1');
    mock.verify();
  });

  it('should trigger data event when column is deleted', function(){
    var mock = sinon.mock(socket);
    mock.expects('send').withArgs(JSON.stringify({
      id: sheet.id,
      type: 'sheet',
      action:'deleteCol', 
      params:[sheet.cols[0]]
    }));
    console.log(sheet);
    sheet.deleteCol(sheet.cols[0]);
    mock.verify();
  });

  it('should trigger data event when row is deleted', function(){
    var mock = sinon.mock(socket);
    mock.expects('send').withArgs(JSON.stringify({
      id: sheet.id,
      type: 'sheet',
      action:'deleteRow', 
      params:[sheet.rows[0]]
    }));
    sheet.deleteRow(sheet.rows[0]);
    mock.verify();
  });

  it('should trigger data event when row is added', function(){
    var mock = sinon.mock(socket);
    mock.expects('send').withArgs(JSON.stringify({
      id: sheet.id,
      type: 'sheet',
      action:'insertRow', 
      params:[0, 'new1']
    }));
    sheet.insertRow(0, 'new1');
    mock.verify();
  });

  it('should call correct method on sheet when "sheet" event is emitted', function(){
    cell_value = '=9000';
    var msg ={
      id: sheet.id,
      type: 'sheet',
      action:'commitCell', 
      params:[sheet.rowAt(0),sheet.colAt(0),{value:cell_value, type:"formula"}]
    };
    sheet.updateCell(sheet.rowAt(0),sheet.colAt(0),cell_value);
    socket.message({
      data:JSON.stringify(msg)
    });
    sheet.getCell(sheet.rowAt(0),sheet.colAt(0)).value.should.equal(cell_value);
    sheet.getCellDisplay(sheet.getCell(sheet.rowAt(0),sheet.colAt(0))).should.equal(9000);
  });
  
  it('should not be able to call unauthorized method on sheet', function(){
    sheet.badMethod = function(){
      throw new Error("should not be called");
    };
    socket.trigger('sheet', {
      id: sheet.id,
      type: 'sheet',
      action:'badMethod', 
      params:[]
    });
  });

  it('should call method on collection when no id attribute is present', function(){
    var msg ={
      type: 'selection',
      action:'addSelection', 
      params:[{id:'test_selection',color:'000000'}]
    };
    socket.message({
      data:JSON.stringify(msg)
    });
    selections
      .get('test_selection')
      .getColor().should.equal('000000')
  });
  

});

});
