if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var io = require('socket.io-client');
var config = require('es_client/config');
var socket = {
  connect: function(){
    return io.connect(config.SOCKET_URL);
  }
};
return socket;

});
