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
      console.log('send',msg);
      this.trigger('send',msg);
    }
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
