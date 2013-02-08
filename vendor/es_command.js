if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

var validator = require('validator');
var sanitize;
if(typeof validator === 'function'){
  sanitize = validator;
} else {
  sanitize = validator.sanitize;
}

var Command = module.exports = function(data_string){
  this.sanitized_data = Command.sanitize(data_string);
  this.msg = Command.parse(this.sanitized_data);
};

Command.sanitize = function(data_string){
  return sanitize(data_string).xss(); 
};

Command.parse = function(serialized_msg){
  return JSON.parse(serialized_msg);
};

Command.serialize = function(msg){
  return JSON.stringify(msg);
};

Command.prototype = {
  execute: function(obj,cb){
    var params = this.getParams();
    if(typeof cb === 'function') params.push(cb);
    obj[this.getAction()].apply(obj,params);
  },
  validate: function(){
  },
  getDataType: function(){
    return this.msg.type;
  },
  getDataId: function(){
    return this.msg.id;
  },
  getAction: function(){
    return this.msg.action;
  },
  getParams: function(){
    return this.msg.params;
  },
  getMessage: function(){
    return this.msg;
  },
  getSerializedMessage: function(){
    return this.sanitized_data;
  }
};


});
