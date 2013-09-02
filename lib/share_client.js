if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module) {

// should look like this ...
//
// var BCSocket = require('bcsocket');
// var share = require('share');
//
// but right now we have:
var BCSocket = window.BCSocket;
var share = window.sharejs;

var connections = {};
var docs = {};

module.exports = function createShareClient(o,cb){
  
  o = o || {};
  var db_data = o.doc;
  var db_host = o.db_host || 'http://localhost:7007/channel';
  var db_collection = o.db_collection || 'es_default_collection';
  var db_name = o.id || 'es_default_name';

  var connection_id = db_host;
  var doc_id = db_host + db_collection + db_name;
  
  if(!connections[connection_id]){
    var s = new BCSocket(db_host, {reconnect: true});
    connections[connection_id] = new share.Connection(s);
  }
  
  var sjs = connections[connection_id];

  if(!docs[doc_id]){
    docs[doc_id] = sjs.get(db_collection,db_name,db_data);
    docs[doc_id].subscribe();
  }

  var doc = docs[doc_id];

  doc.whenReady(function(){
    if (!doc.type){
      doc.create('json0');
    }

    if (!doc.type || doc.type.name !== 'json0'){
      throw new Error('Unknown or incorrect doc type');
    }
    
    cb(null,doc);
  });
}

});