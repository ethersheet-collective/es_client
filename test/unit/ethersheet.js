if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var assert = require('chai').assert;
var Ethersheet = require('es_client/ethersheet');
var Sheet = require('es_client/models/sheet');
var SheetCollection = require('es_client/models/sheet_collection');
var $ = require('jquery');

var $container = $('<div id="ethersheet-container" style="display:none;"></div').appendTo('body');

describe('Ethersheet Client', function(){
  var es;

  beforeEach(function(done){
    $container.empty();

    es = new Ethersheet({
      target:'#ethersheet-container',
      channel:'test_channel',
      sheets:[
        {id: 'test_sheet_0'},
        {id: 'test_sheet_1'}
      ],
      onConnect: function(){
        done();
      }
    });

  });

  afterEach(function(done){
    $container.empty();
    es.destroy(done);
  });

  describe('options we have defined so far', function(){

    it('sheets',function(){
      assert.equal(es.data.sheets.length, 2);
    });

    it('target',function(){
      assert.ok($container.html().length < 10);
    });

    it('channel',function(){
      assert.ok(es.socket.ws._base_url.indexOf("/test_channel/") !== -1);
    });
  });
});

});
