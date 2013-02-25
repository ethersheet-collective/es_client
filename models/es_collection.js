if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module){
/*
 
  # ESCollection

  Base collection for ethersheet collecitons.


  */


var Backbone = require('backbone');
var ESCollection = module.exports = Backbone.Collection.extend({

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
      msg = this.formatMessage(msg);
      this.trigger('send',msg);
    }
  },
  alwaysSend: function(msg){
    var send_enabled = this.send_enabled;
    this.enableSend();
    this.send(msg);
    if(!send_enabled) this.disableSend();
  },
  formatMessage: function(msg){
    if(!msg.params) msg.params = [];
    return msg;
  }
});

});
