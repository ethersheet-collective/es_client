if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var io = require('socket.io-client');
var config = require('es_client/config');

return {
  connect: function(){
    var sock = io.connect(config.SOCKET_URL);
    return sock;
  }
};

});
