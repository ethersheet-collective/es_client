if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

var Command = module.exports = function(data){
  if(data.substring){
    this.initWithString(data);
  }
  else{
    this.initWithHash(data);
  }
}

Command.sanitize = function(data_string){
  var safe_data_string = data_string.
    replace(/>/g, '&gt;').
    replace(/</g,'&lt;');
  return safe_data_string;

};

Command.parse = function(serialized_msg){
  return JSON.parse(serialized_msg);
};

Command.serialize = function(msg){
  return JSON.stringify(msg);
};

Command.prototype = {
  initWithString: function(data_string){
    this.sanitized_data = Command.sanitize(data_string);
    this.msg = Command.parse(this.sanitized_data);
  },
  initWithHash: function(msg){
    this.sanitized_data = null;
    this.msg = msg;
  },
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
    if(!this.sanitized_data && this.msg){
     this.sanitized_data = Command.serialize(this.msg);
    }
    return this.sanitized_data;
  }
};


});
