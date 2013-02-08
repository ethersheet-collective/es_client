if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){

var _ = require('underscore');
var helpers = require('es_client/helpers');
module.exports = module.exports || {};
module.exports['table_col_headers'] = _.template("<% var h = require('es_client/helpers'); %>\n<tr>\n  <% for(var i=0; i<num_col; i++){ %>\n    <th class=\"column-header\"><%= h.columnIndexToName(i) %></th>\n  <% } %>\n</tr>\n");
module.exports['sheet_table'] = _.template("<div id=\"es-table-<%= id %>\">\n  <table class=\"row-headers table\">\n    <thead id=\"row-headers-<%=id%>\"></thead>\n    <tbody></tbody>\n  </table>\n  <table class=\"column-headers table\">\n    <thead id=\"column-headers-<%=id%>\"></thead>\n    <tbody></tbody>\n  </table>\n  <table class=\"table\">\n    <thead></thead>\n    <tbody id=\"data-table-<%=id%>\"></tbody>\n  </table>\n</div>\n");
module.exports['table'] = _.template("<% var _ = require('underscore'); %>\n<% _.each(sheet.rowIds(), function(row_id){ %>\n  <tr class=\"es-table-row\" data-row_id=\"<%= row_id %>\">\n    <% _.each(sheet.colIds(), function(col_id){ %>\n      <td id=\"<%= row_id %>-<%= col_id %>\" class=\"es-table-cell\" style=\"background-color: <%= sheet.getColor(row_id, col_id) %>\" data-row_id=\"<%= row_id %>\" data-col_id=\"<%= col_id %>\" data-value=\"<%= sheet.getValue(row_id,col_id)%>\"><%= sheet.getDisplayValue(row_id,col_id) %></td>\n    <% }) %>\n  </tr>\n<% }) %>\n");
module.exports['table_row_headers'] = _.template("<tr>\n  <th class=\"table-corner\"></th>\n</tr>\n<% for(var i=1; i<=num_row; i++){ %>\n  <tr>\n    <th class=\"row-header\"><%= i %></th>\n  </tr>\n<% } %>\n");
var templateWrapper = function(template){
  return function(data){
    data = data || {};
    data.require = require;
    return template(data);
  }
};
for(i in module.exports) module.exports[i] = templateWrapper(module.exports[i]);

});
