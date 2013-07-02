if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

var Sheet = require('es_client/models/sheet');
var SheetCollection = require('es_client/models/sheet_collection');
var SelectionCollection = require('es_client/models/selection_collection');
var TableView = require('es_client/views/table');
var UserCollection = require('es_client/models/user_collection');
var ES = require('es_client/config');

var data = {};
data.sheet = new SheetCollection();
local_sheet = new Sheet();
data.sheet.add(local_sheet);
data.selection = new SelectionCollection([],{sheet_collection:data.sheet});
data.selection.createLocal();
data.user = new UserCollection();
data.user.createCurrentUser();

module.exports = data;

});
