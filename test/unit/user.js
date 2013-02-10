if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var assert = require('chai').assert;
var UserCollection = require('es_client/models/user_collection');
var User = require('es_client/models/user');
var EventTrap = require('es_client/test/event_trap');

describe('User', function(){
  var users, event_trap;

  beforeEach(function(){
    trap = new EventTrap();
    users = new UserCollection();
    users.on('all',trap.eventHandler);
  });

  afterEach(function(){
    trap.clearEvents(); 
  });

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
  describe('getData',function(){
    var user, user_data;

    beforeEach(function(){
      user = new User({id:'test_user'});
      user_data = user.getData();
    });

    it('should return the correct data',function(){
      assert.deepEqual(user_data,{id:'test_user'});
    });
  });

  describe('addUser',function(){

    beforeEach(function(){
      users.addUser({id:'test_user'});
    });

    it('should add the user to the collection',function(){
      console.log(users.get('test_user'));
      assert.deepEqual(users.get('test_user').getData(),
                       {id:'test_user'});
    });

    it('should emit an addUser event',function(){
      var expected_event = {
        name:'send',
        args:[{
          type:'user',
          action:'addUser',
          params:[{
            id:'test_user' 
          }]
        }]
      };
      assert.equal(trap.events.length,2);
      assert.deepEqual(trap.events[1],expected_event);
    });
  });

});

});
