if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var SheetCollection = require('es_client/models/sheet_collection');
var SelectionCollection = require('es_client/models/selection_collection');
var config = require('es_client/config');
var expect = require('chai').expect;
var should = require('chai').should();
var sinon = require('sinon');
var Socket = require('es_client/lib/socket');

var fake_websocket = {
  send: function(){}
};

describe('Websockets', function(){
  var socket, selections, sheets, sheet;

  beforeEach(function(){
    sheets = new SheetCollection();
    sheets.add({});
    sheet = sheets.first();
    selections = new SelectionCollection([],{sheet_collection:sheets});
    selections.createLocal();
    socket = new Socket('test_channel',{sheet:sheets,selection:selections},fake_websocket);
    cell = {value:1,type:"number"};
  });

  it('should trigger data event when cell is updated', function(){
    var mock = sinon.mock(socket);
    mock.expects('send').withArgs({
      id: sheet.id,
      type: 'sheet',
      action:'updateCell', 
      params:[sheet.rowAt(0),sheet.colAt(0),1]
    });

    sheet.updateCell(sheet.rowAt(0),sheet.colAt(0),1);
    mock.verify();
  });

  it('should trigger data event when cell is committed', function(){
    var mock = sinon.mock(socket);
    mock.expects('send').withArgs({
      id: sheet.id,
      type: 'sheet',
      action:'commitCell', 
      params:[sheet.rowAt(0),sheet.colAt(0),{value:1, type:'number'}]
    });

    sheet.disableSend();
    sheet.updateCell(sheet.rowAt(0),sheet.colAt(0),1);
    sheet.enableSend();
    sheet.commitCell(sheet.rowAt(0),sheet.colAt(0));
    mock.verify();
  });


  it('should call correct method on sheet when "sheet" event is emitted', function(){
    cell_value = '=9000';
    var msg ={
      id: sheet.id,
      type: 'sheet',
      action:'commitCell', 
      params:[sheet.rowAt(0),sheet.colAt(0)]
    };
    sheet.updateCell(sheet.rowAt(0),sheet.colAt(0),cell_value);
    socket.onMessage({
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
      action:'replicateSelection', 
      params:[{id:'test_selection',color:'000000'}]
    };
    socket.onMessage({
      data:JSON.stringify(msg)
    });
    selections
      .get('test_selection')
      .getColor().should.equal('000000')
  });
  

});

});
