if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){

module.exports = {
  columnIndexToName: require('./column_index_to_name'),
  uid: require('./helpers/uid')
}

});
