
if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){
  
/*
  #Ethersheet Container View

  Container template for all other ethersheet views.

*/

var $ = require('jquery');
var t = require('es_client/templates');
var RefBinder = require('ref-binder');
var View = require('backbone').View;

var EthersheetContainer = module.exports = View.extend({
  render: function(){
    $(this.el).html(t.es_container);
    return this;
  },
});

});
