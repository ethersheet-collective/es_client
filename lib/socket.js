if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module) {

var _ = require('underscore');
var $ = require('jquery');
var Events = require('backbone').Events;
var SockJS = require('sockjs-client');

var Socket = module.exports = function(channel,socket_id,websocket){
  this.open_handler = function(){};
  this.close_handler = function(){
    $('#es-modal-box').html("<h1>Your connection to the server has been lost, please refresh the page.</h1>");
    $('#es-modal-overlay').show();
  };
  this.error_handler = function(){};
  this.message_handler = function(){};
  this.initWebsocket(channel,socket_id,websocket);
};

_.extend(Socket.prototype, Events,{

  initWebsocket: function(channel,socket_id,websocket){
    var socket = this;
    this.ws = websocket || new SockJS(window.location.protocol + '//' + window.location.host +'/'+ channel +'/pubsub/',{debug:true,devel:true});

    this.ws.onopen = _.bind(this.open,this);
    this.ws.onerror= _.bind(this.error,this);
    this.ws.onclose = _.bind(this.close,this);
    this.ws.onmessage = _.bind(this.message,this);
  },

  onMessage: function(handler){
    this.message_handler = handler;
  },

  message: function(e){
    this.message_handler(e);
  },

  onOpen: function(handler){
    this.open_handler = handler;
  },
  
  open: function(e){
    this.open_handler(e);
  },

  onClose: function(handler){
    this.close_handler = handler;
  },
  
  close: function(e){
    this.close_handler(e);
  },

  onError: function(handler){
    this.error_handler = handler;
  },
  
  error: function(e){
    this.error_handler(e);
  },

  send: function(msg){
    this.ws.send(msg);
  }
});

});
