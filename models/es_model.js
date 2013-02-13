if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module){
/*

  # ESModel 

  Base model for all ethersheet models.

*/



var Backbone = require('backbone');

var ESModel = module.exports = Backbone.Model.extend({

// # Send

  sendEnabled: function(){
    return this.send_enabled;
  },
  enableSend: function(){
    this.send_enabled = true;
  },
  disableSend: function(){
    this.send_enabled = false;
  },
  send: function(msg){
    if(this.sendEnabled()){
      this.trigger('send',msg);
    }
  },
  alwaysSend: function(msg){
    var send_enabled = this.send_enabled;
    this.enableSend();
    this.send(msg);
    if(!send_enabled) this.disableSend();
  },

// # Unused

  sync: function(method, model, options){
    console.log('WARNING: sync is unused in ethersheet'); 
  },

  save: function(method, model, options){
    console.log('WARNING: save is unused in ethersheet'); 
  },

  reset: function(method, model, options){
    console.log('WARNING: reset is unused in ethersheet'); 
  },

  fetch: function(method, model, options){
    console.log('WARNING: fetch is unused in ethersheet'); 
  }

});

});
