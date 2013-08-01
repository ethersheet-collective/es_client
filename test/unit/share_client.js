if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var assert = require('chai').assert;
var config = require('es_client/config');
var initializeShareContext = require('es_client/lib/share_db').initializeShareContext;
var createData = require('es_client/lib/data').createData;
var destroyData = require('es_client/lib/data').destroyData;

describe('ShareDB', function(){
  var test_data, test_db;

  describe('initializeShareContext', function(){

    beforeEach(function(done){
      initializeShareContext({},function(err,share_db){
        test_db = share_db;
        done();
      });
    });

    afterEach(function(done){
      test_db.destroy();
      done();
    });

    it('should create default data structure', function(){
      var expected_snapshot = {
        sheets:{},
        selections:{},
        users:{}
      }
      assert.deepEqual(test_db.get(),expected_snapshot);
    });

    describe('createData', function(){
      beforeEach(function(done){
        var o = {
          channel:'create_data_test',
          share_db:test_db
        };
        createData(o,function(err,data){
          test_data = data;
          console.log('baa',test_data);
          done();
        });
      });

      afterEach(function(done){
        destroyData(test_data,function(err){
          done(err);
        });
      });

      it('should create a sheet collection', function(){
        assert.equal(typeof test_data.sheets.addSheet,'function');
      });

    });
  });

});

});
