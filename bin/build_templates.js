#!/usr/bin/env node
var stitchit = require('stitchit');
var fs = require('fs');

var TEMPLATE_PATH = __dirname + '/../templates/';
var TEMPLATE_NAMESPACE = 'module.exports';
var FILE_NAME = __dirname + '/../templates.js';

stitchit({path:TEMPLATE_PATH,namespace:TEMPLATE_NAMESPACE},function(err,templates){
  if(err) throw err;

  templates = 
    "if (typeof define !== 'function') { var define = require('amdefine')(module) }\n"+
    "define( function(require,exports,module){\n\n"+
    "var _ = require('underscore');\n"+
    "var helpers = require('es_client/helpers');\n"+
    templates;

  // shim for injecting require into template environment
  // so we can access helper functions when running in node
  if(typeof window === 'undefined'){
    templates += 
      "var templateWrapper = function(template){\n"+
      "  return function(data){\n"+
      "    data = data || {};\n"+
      "    data.require = require;\n"+
      "    return template(data);\n"+
      "  }\n"+
      "};\n"+
      "for(i in module.exports) module.exports[i] = templateWrapper(module.exports[i]);\n"; 
  }

  templates += "\n});\n";

  fs.writeFileSync(FILE_NAME,templates);
});
