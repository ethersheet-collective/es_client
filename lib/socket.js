if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var io = require('socket.io-client');
var config = require('es_client/config');

return {
  connect: function(){
    var sock = io.connect(config.SOCKET_URL);
    sock.on('update_cell', function(params){
      console.log('foo');
      sock.emit('client_action', {
                  channel: 'sheet',
                  id: params.sheet_id,
                  action: 'update_cell',
                  params: params
                });
    });
    return sock
  }
};

});
