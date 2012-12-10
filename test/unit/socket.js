if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var Sheet = require('es_client/models/sheet');
var config = require('es_client/config');
var expect = require('chai').expect;
var should = require('chai').should();
var sinon = require('sinon');
var socket = require('es_client/lib/socket').connect();

describe('Websockets', function(){
  var websocket, sheet;

  before(function(){
    sheet = new Sheet({socket: socket});
  });

  it('should respond to update cell event', function(){
    var mock = sinon.mock(socket);
    mock.expects('emit').withArgs('sheet',{
      action:'update_cell', 
      params:{id:sheet.id,row_id:sheet.rowAt(0),col_id:sheet.colAt(0),value:1}
    });

    sheet.updateCell(sheet.rowAt(0),sheet.colAt(0),1);
    mock.verify();
  });
});

});
