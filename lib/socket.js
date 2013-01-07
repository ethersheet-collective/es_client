if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module) {

var _ = require('underscore');
var Events = require('backbone').Events;
var SockJS = require('sockjs');
var Command = require('es_command');

var Socket = module.exports = function(channel,data,websocket){
  this.initWebsocket(channel,websocket);
  this.bindDataToSocket(data || {});
};

_.extend(Socket.prototype, Events,{

  initWebsocket: function(channel,websocket){
    var socket = this;
    this.ws = websocket || new SockJS(window.location.protocol + '//' + window.location.host +'/'+ channel +'/pubsub/',{debug:true,devel:true});

    this.ws.onopen = function(e){
      console.log('onopen',e);
    };
    this.ws.onerror = function(e){
      console.log('onerror',e);
    };
    this.ws.onclose = function(e){
      console.log('onclose',e);
    };
    this.ws.onmessage = this.onMessage.bind(this);
  },

  onMessage: function(e){
      console.log('onmessage',e);
      var c = new Command(e.data);
      var model = this.getModel(c.getDataType(),c.getDataId());

      model.disableSend();
      c.execute(model);
      model.enableSend();
  },

  send: function(msg){
    this.ws.send(Command.serialize(msg));
  },

  bindDataToSocket: function(data){
    var socket = this;
    socket.data = data;
    for(var type in data){
      data[type].on('send',function(msg){
        socket.send(msg);
      });
    }
  },
 
  getModel: function(type,id){
    return this.data[type].get(id);
  }
});

});
