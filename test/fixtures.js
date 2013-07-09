if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

var Sheet = require('es_client/models/sheet');
var SheetCollection = require('es_client/models/sheet_collection');
var SelectionCollection = require('es_client/models/selection_collection');
var TableView = require('es_client/views/table');
var UserCollection = require('es_client/models/user_collection');
var User = require('es_client/models/user');
var config = require('es_client/config');

var data = {};
data.sheet = new SheetCollection();
data.local_sheet = new Sheet();
data.sheet.add(data.local_sheet);
data.selection = new SelectionCollection([],{sheet_collection:data.sheet});
data.user = new UserCollection([],{selection_collection:data.selection});
var new_user = new User();
data.user.createCurrentUser(new_user);
data.user.getCurrentUser().setCurrentSheetId(data.local_sheet.id);
data.selection.createLocal({
    user_id:data.user.getCurrentUser().id,
    color:config.DEFAULT_LOCAL_SELECTION_COLOR
});
data.local_selection = data.selection.getLocal();
module.exports = data;

});
