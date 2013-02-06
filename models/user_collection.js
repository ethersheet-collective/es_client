if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

/*
  # User Collection
*/

var ESCollection= require('./es_collection');
var User = require('./selection');

var UserCollection = module.exports = ESCollection.extend({

  model: User,

  initialize: function(models,o){
    o = o || {};
    this.send_enabled = true;
    this.current_user = null;
  },

// ## Current User

  createCurrentUser: function(){
    var current_user = this.getCurrentUser() || new User();
    this.setCurrentUser(current_user);
  },

  getCurrentUser: function(){
    return this.current_user;
  },

  setCurrentUser: function(user){
    this.unsetCurrentUser();
    if(!this.get(user.id)) this.add(user);
    this.current_user = user;
  },

  unsetCurrentUser: function(){
    if(!this.current_user) return;
    this.current_user.off(null,null,null);
    this.current_user = null;
  }

});

});
