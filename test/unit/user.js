if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var assert = require('chai').assert;
var UserCollection = require('es_client/models/user_collection');
var User = require('es_client/models/user');

describe('User', function(){
  var users;

  var initializeUsers = function(){
    users = new UserCollection();
  };

  beforeEach(initializeUsers);

  describe('createCurrentUser',function(){
    
    beforeEach(function(){
      users.createCurrentUser();
    });

    it('should create a current user',function(){    
      assert.isNotNull(users.getCurrentUser());      
      assert.isNotNull(users.getCurrentUser().id);      
    });
  });

  describe('setCurrentUser',function(){
    var user;
    
    beforeEach(function(){
      user = new User({id:'test_user'});
      users.setCurrentUser(user);
    });

    it('should set the current user',function(){
      assert.equal(users.getCurrentUser().id,'test_user');
    });

    it('should add the user to the collection',function(){
      var test_user = users.get('test_user');
      assert.equal(test_user.id,'test_user');
    });

  });


});

});
