if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

var createShareClient = require('es_client/lib/share_client');
var createData = require('es_client/lib/data').createData;
var destroyData = require('es_client/lib/data').destroyData;

var INITIAL_DATA_STRUCTURE = {
  meta:{},
  sheets:{},
  selections:{},
  users:{}
};

var connect = module.exports.connect = function(o,cb){
  o = o || {};
  initializeShareContext(o,function(err,share_db){
    o.share_db = share_db;
    createData(o,cb);
  });
};

var disconnect = module.exports.disconnect = function(data,cb){
  destroyData(data,cb);
};

var initializeShareContext = module.exports.initializeShareContext = function(o,cb){
  createShareClient(o,function(err,doc){
    var share_db = doc.createContext();
    share_db.set(INITIAL_DATA_STRUCTURE,function(){
      cb(null,share_db);  
    });
  });
};

});