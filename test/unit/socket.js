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
    mock.expects('emit').withArgs('client_action', 
                                  {
                                    channel:"sheet", 
                                    id:sheet.id, 
                                    action:'update_cell', 
                                    params:{row_id:1,col_id:1,value:1}
                                  });

    sheet.trigger('update_cell',{
      sheet_id:this.id,
      row_id:1,
      col_id:1,
      value:1
    });
    mock.verify()

  });
});

});
