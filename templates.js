if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){

var _ = require('underscore');
var helpers = require('es_client/helpers');
module.exports = module.exports || {};
module.exports['import_dialog'] = _.template("<div id='es-modal-close'>[close]</div><h2>Import CSV</h2>\n<form action=\"/import/csv\" method=\"post\" enctype=\"multipart/form-data\">\n  <input type=\"file\" name=\"csv_file\"><input type='submit' value='Upload'>\n  <input type=\"hidden\" name=\"sheet_id\" value=\"<%=sheet_id%>\">\n</form>\n\n\n");
module.exports['sheet_list'] = _.template("<ul id='es-sheet-list'>\n<% var _ = require('underscore'); %>\n<% sheets.each(function(sheet){ %>\n<li><%=sheet.meta.title%></li>\n<%});%>\n<a id='es-add-sheet-button'>+ Add Sheet</a>\n");
module.exports['sheet_table'] = _.template("<div id=\"es-table-<%= id %>\" class=\"es-table-view\">\n  <table id=\"es-column-headers-<%=id%>\" class=\"es-column-headers es-table\">\n    <thead></thead>\n    <tbody></tbody>\n  </table>\n  <table id=\"es-row-headers-<%=id%>\" class=\"es-row-headers es-table\">\n    <thead></thead>\n    <tbody></tbody>\n  </table>\n  <div id=\"es-grid-container-<%= id %>\" class=\"es-grid-container\">\n    <table id=\"es-grid-<%= id %>\" class=\"es-grid es-table\">\n      <thead></thead>\n      <tbody id=\"es-data-table-<%=id%>\"></tbody>\n    </table>\n  </div>\n  <div class=\"es-table-corner\">\n    <div class=\"es-logo es-sidebar-toggle\">ES</div>\n  </div>\n</div>\n");
module.exports['table'] = _.template("<% var _ = require('underscore'); %>\n<% _.each(sheet.rowIds(), function(row_id,i){ %>\n  <tr id=\"<%= row_id %>\" class=\"es-table-row\" data-row_id=\"<%= row_id %>\" style=\"height:<%= sheet.getRowHeight(row_id) %>px;\">\n    <% if(i == 0) { %>\n      <% _.each(sheet.colIds(), function(col_id){ %>\n        <td id=\"<%= row_id %>-<%= col_id %>\" style=\"width:<%= sheet.getColWidth(col_id) %>px;\" class=\"<%= sheet.getCellFormatString(row_id,col_id) %>\" data-row_id=\"<%= row_id %>\" data-col_id=\"<%= col_id %>\" data-value=\"<%= sheet.getCellValue(row_id,col_id)%>\"><%= sheet.getCellDisplayById(row_id,col_id) %></td>\n      <% }) %>\n    <% } else { %>\n      <% _.each(sheet.colIds(), function(col_id){ %>\n        <td id=\"<%= row_id %>-<%= col_id %>\" class=\"<%= sheet.getCellFormatString(row_id,col_id) %>\" data-row_id=\"<%= row_id %>\" data-col_id=\"<%= col_id %>\" data-value=\"<%= sheet.getCellValue(row_id,col_id)%>\"><%= sheet.getCellDisplayById(row_id,col_id) %></td>\n      <% }) %>\n    <% } %>\n  </tr>\n<% }) %>\n");
module.exports['menu'] = _.template("<ul id=\"es-menu-list\">\n  <li>\n    <a  id=\"es-menu-add-column\" \n        class=\"es-menu-button\" \n        data-action=\"add_column\"><b>+</b> Add Column</a>\n  </li><li>\n    <a  id=\"es-menu-remove-column\" \n        class=\"es-menu-button\" \n        data-action=\"remove_column\"><b>-</b> Remove Column</a>\n  </li><li>\n    <a  id=\"es-menu-add-row\" \n        class=\"es-menu-button\" \n        data-action=\"add_row\"><b>+</b> Add Row</a>\n  </li><li>\n    <a  id=\"es-menu-remove-row\" \n        class=\"es-menu-button\" \n        data-action=\"remove_row\"><b>-</b> Remove Row</a>\n  </li><li>\n    <a  id=\"es-menu-sort-rows\" \n        class=\"es-menu-button\" \n        data-action=\"sort_rows\"><b>^</b> Sort Rows</a>\n  </li><li>\n    <a  id=\"es-menu-format-cell\"\n        class=\"es-menu-button\" \n        data-action=\"format_cell\"><b>#</b> Format Cell</a>\n  </li><li>\n    <a  id=\"es-menu-import-csv\"\n        class=\"es-menu-button\" \n        data-action=\"import_csv\"><b>&lt;&lt;</b> Import CSV</a>\n  </li><li>\n    <a  id=\"es-menu-export-csv\"\n        class=\"es-menu-button\"\n        href=\"<%=document.URL%>.csv\"\n        target=\"_blank\"><b>&gt;&gt;</b> Export CSV</a>\n  </li>\n</ul>\n<div class='clear'></div>\n");
module.exports['cell_format_dialog'] = _.template("<div id='es-modal-close'>[close]</div><h2>Format Cell</h2>\n<div class='es-format-toggle' id='es-bg-red'>bg red</div>\n<div class='es-format-toggle' id='es-bg-white'>bg white</div>\n<div class='es-format-toggle' id='es-usd'>money</div>\n");
module.exports['es_container'] = _.template("<div id=\"es-container\">\n  <div id=\"es-panel-0\" class=\"es-panel\">\n    <h1 style=\"margin-top:-6px;\">EtherSheet</h1>\n    <fieldset style=\"margin-top:8px;\">\n      <legend>Sheets</legend>\n      <div id='es-sheet-list-container'></div>\n    </fieldset>\n    <h3 style=\"margin-top:8px;\">History</h3>\n    <div id=\"es-history-container\"></div>\n  </div>\n  <div id=\"es-panel-2\" class=\"es-panel\">\n    <h3 style=\"margin:-6px 0 4px 0;\">&#402;(x)</h3>\n    <div id=\"es-expression-editor-container\"></div>\n    <fieldset style=\"margin-top:8px;\">\n      <legend>TOOLKITS</legend>\n      <select id=\"es-toolkit-picker\" \n        style= \"width: 100%;\n                background-color: #ffffff;\n                border: 1px solid #333;\n                height: 28px;\n                display: block;\"\n      >\n        <option value=\"edit_sheet\">\n            Edit Sheet\n        </option>\n        <option value=\"import_export\">\n            Import/Export\n        </option>\n      </select>\n      <hr/>\n      <div id=\"es-menu-container\"></div>\n    </fieldset>\n  </div>\n  <div id=\"es-panel-1\" class=\"es-panel\">\n    <div id=\"es-table-container\"></div>\n  </div>\n  <div id=\"es-modal-overlay\"><div id=\"es-modal-box\"></div></div>\n</div>\n");
module.exports['expression_editor'] = _.template("<textarea class=\"es-expression-editor-input\" type='text'></textarea>\n");
var templateWrapper = function(template){
  return function(data){
    data = data || {};
    data.require = require;
    return template(data);
  }
};
for(i in module.exports) module.exports[i] = templateWrapper(module.exports[i]);

});
