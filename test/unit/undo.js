if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var UndoQ = require('es_client/lib/undo');
var Command = require('es_command');
var expect = require('chai').expect;

describe('UndoQ', function(){
  var undoQ,cmd,undo_cmd;

  cmd =  new Command(JSON.stringify({
    id: this.id,
    type: 'sheet',
    action: 'deleteRow',
    params:[123]
  }));

  undo_cmd =  new Command(JSON.stringify({
    id: this.id,
    type: 'sheet',
    action: 'addRow',
    params:[{id:123,index:3}]
  }));

  beforeEach(function(){
    undoQ = new UndoQ();
    undoQ.push(cmd,undo_cmd);
  });
  
  it("push",function(){
    undoQ.push(cmd,undo_cmd);
    var count = undoQ.count();
    expect(count).to.equal(2);
  });

  it("current",function(){
    var current = undoQ.current();
    expect(current[0]).to.equal(cmd);
    expect(current[1]).to.equal(undo_cmd);
  });

  it("undo",function(){
    var result = undoQ.undo();
    expect(result).to.equal(undo_cmd);
  });

  it("do",function(){
    undoQ.undo();
    var result = undoQ.do();
    expect(result).to.equal(cmd);
  });

});

});
