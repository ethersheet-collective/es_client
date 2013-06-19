if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

/*
  # User Collection
*/

var ESCollection= require('./es_collection');
var User = require('./user');

var UserCollection = module.exports = ESCollection.extend({

  model: User,

  initialize: function(models,o){
    o = o || {};
    this.send_enabled = true;
    this.current_user = null;
    this.selection_collection = o.selection_collection;
  },

// ## CRUD

  addUser: function(user_data){
    var user = new User(user_data);
    this.add(user);
    this.send({
      type:'user',
      action:'addUser',
      params:[user.getData()]
    });
  },

  removeUser: function(id){
    var user = this.get(id);
    if(!user) return;
    user.destroy();
  },

// ## Replication
  replicateUser: function(id){
    var user = this.get(id);
    if(!user) return;
    this.alwaysSend({
      type:'user',
      action:'addUser',
      params:[user.getData()]
    });
  },

  replicateCurrentUser: function(){
    var user = this.getCurrentUser();
    this.replicateUser(user.id);
  },

  requestReplicateCurrentUser: function(){
    this.alwaysSend({
      type:'user',
      action:'replicateCurrentUser'
    });
  },

// ## Current User

  createCurrentUser: function(user_data){
    var user = new User(user_data);
    this.add(user);
    this.setCurrentUser(this.get(user.id));
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
