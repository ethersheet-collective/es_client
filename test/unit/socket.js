if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var SheetCollection = require('es_client/models/sheet_collection');
var config = require('es_client/config');
var expect = require('chai').expect;
var should = require('chai').should();
var sinon = require('sinon');
var Socket = require('es_client/lib/socket');


describe('Websockets', function(){
  var socket, sheets, sheet;

  beforeEach(function(){
    sheets = new SheetCollection();
    sheets.add({});
    sheet = sheets.first();
    socket = new Socket('test_channel',{sheet:sheets});
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
    sheet.getValue(sheet.rowAt(0),sheet.colAt(0)).should.not.equal(cell_val)
    socket.onMessage({
      data:JSON.stringify({
        id: sheet.id,
        type: 'sheet',
        action:'updateCell', 
        params:[sheet.rowAt(0),sheet.colAt(0),cell_val]
      })
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
});

});
