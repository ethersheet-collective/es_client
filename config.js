if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require){
	
// Ethersheet namespace and constants
return {
  DEFAULT_ROW_COUNT: 100,
  DEFAULT_COL_COUNT: 20,
  DEFAULT_ROW_HEIGHT: 22,
  DEFAULT_COL_WIDTH: 100,
  SOCKET_URL: "http://localhost",
  DEFAULT_SELECTION_COLOR: '#ccddff',
  DEFAULT_LOCAL_SELECTION_COLOR: '#2bb573',
  DEFAULT_COLOR: '#ffffff'
};

});
