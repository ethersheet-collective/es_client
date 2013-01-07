if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){

module.exports = {
  columnIndexToName: require('es_client/helpers/column_index_to_name'),
  uid: require('es_client/helpers/uid')
}

});
