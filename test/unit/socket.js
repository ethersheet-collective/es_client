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

  it('should call correct method on sheet when "sheet" event is emitted', function(){
    var cell_val = 'over 9000';
    var msg ={
      id: sheet.id,
      type: 'sheet',
      action:'updateCell', 
      params:[sheet.rowAt(0),sheet.colAt(0),cell_val]
    };
    sheet.getValue(sheet.rowAt(0),sheet.colAt(0)).should.not.equal(cell_val)
    socket.onMessage({
      data:JSON.stringify(msg)
    });
    sheet.getValue(sheet.rowAt(0),sheet.colAt(0)).should.equal(cell_val)
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
