if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require){

  var RefBinder = function(target){
    this._ref = {};
    this.target = target;
  }

  RefBinder.prototype.get = function(name,obj,events){
    return this._ref[name];
  };

  RefBinder.prototype.set = function(name,obj,events){
    this.unset(name);
    for(var e_name in events){
      obj.on( e_name, this.target[events[e_name]], this.target);
    }
    this._ref[name] = obj;
  };

  RefBinder.prototype.unset = function(name){
    if(!this._ref[name]) return;
    this._ref[name].off(null,null,this);
    delete this._ref[name];
  };

  RefBinder.prototype.unsetAll = function(){
    for(var name in this._ref){
      this.unset(name);
    }
  };

  return RefBinder;

});
