if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require,exports,module) {

var Sheet = require('es_client/models/sheet');
var SheetCollection = require('es_client/models/sheet_collection');
var SelectionCollection = require('es_client/models/selection_collection');
var TableView = require('es_client/views/table');
var UserCollection = require('es_client/models/user_collection');
var User = require('es_client/models/user');
var initializeExpressionHelpers = require('es_client/lib/expression_helpers');
var config = require('es_client/config');
var data = {};
var expressionHelpers = initializeExpressionHelpers(data);

var getData = module.exports = function(o){
  o.sheet_options = o.sheet_options || {}
  o.sheet_options.expressionHelpers = expressionHelpers;
  data.sheets = new SheetCollection();
  data.local_sheet = new Sheet(o.sheet_options);
  data.sheets.add(data.local_sheet);

  data.users = new UserCollection([],{selection_collection:data.selections});
  var new_user = new User();
  data.users.createCurrentUser(new_user);
  data.users.getCurrentUser().setCurrentSheetId(data.local_sheet.id);

  data.selections = new SelectionCollection([],{sheet_collection:data.sheets});
  data.selections.createLocal({
      user_id:data.users.getCurrentUser().id,
      color:config.DEFAULT_LOCAL_SELECTION_COLOR
  });
  data.local_selection = data.selections.getLocal();
  return data;
}

});
