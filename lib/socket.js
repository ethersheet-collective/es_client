if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var _ = require('underscore');
var Events = require('backbone').Events;
var SockJS = require('sockjs');

var Socket = function(channel){
  var socket = this;

  this.ws = new SockJS(window.location.protocol + '//' + window.location.host +'/'+ channel +'/pubsub/',{debug:true,devel:true});

  this.on('data',function(data){
    socket.ws.send(JSON.stringify(data)); 
  });

  this.ws.onmessage = function(e){
    console.log('onmessage',e);
    var data = JSON.parse(e.data);
    socket.trigger(data.type,data);
  };

  this.ws.onopen = function(e){
    console.log('onopen',e);
  };
  this.ws.onerror = function(e){
    console.log('onerror',e);
  };
  this.ws.onclose = function(e){
    console.log('onclose',e);
  };
};

_.extend(Socket.prototype, Events);

return Socket;
});
