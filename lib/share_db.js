if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

var createShareClient = require('./share_client');
var createData = require('./data').createData;
var destroyData = require('./data').destroyData;

var INITIAL_DATA_STRUCTURE = {
  meta:{},
  sheets:{},
  selections:{},
  users:{}
};

var connect = module.exports.connect = function(o,cb){
  o = o || {};
  createShareClient(o,function(err,doc){
    var share_db = doc.createContext();
    if(!share_db.get()) share_db.set(INITIAL_DATA_STRUCTURE);
    o.share_db = share_db;
    createData(o,cb);
  });
};

var disconnect = module.exports.disconnect = function(data,cb){
  destroyData(data,cb);
};

});