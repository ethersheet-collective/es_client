if (typeof define !== 'function') { var define = require('amdefine')(module) }
define( function(require,exports,module){

var _ = require('underscore');
var helpers = require('es_client/helpers');
module.exports = module.exports || {};
module.exports['cell_format_dialog'] = _.template("<div id='es-modal-close'>[close]</div><h2>Format Cell</h2>\n<div class='es-format-toggle' id='es-bg-red'>bg red</div>\n<div class='es-format-toggle' id='es-bg-white'>bg white</div>\n<div class='es-format-toggle' id='es-usd'>money</div>\n");
module.exports['es_container'] = _.template("<div id=\"es-container\">\n  <div id=\"es-header\">\n    <div class=\"es-sidebar-toggle i18n\" id=\"es-sheet-icon\" data-i18n=\"[title]manageSheets\"></div>\n    <div class=\"es-sidebar-toggle i18n\" id=\"es-function-icon\" data-i18n=\"[title]functionHelp\"></div> \n    <div class=\"es-sidebar-toggle i18n\" id=\"es-style-icon\" data-i18n=\"[title]styleSheet\"></div>\n    <!--<div class=\"es-sidebar-toggle i18n\" id=\"es-activity-icon\" data-i18n=\"[title]viewTimeline\"></div> -->\n\n    <div id=\"es-logo\"><h1><%=title%></h1> </div>\n    <div class=\"clear\"></div>\n  </div>\n  <div id=\"es-panel-0\" class=\"es-panel\">\n    <div class='menu-container' id='es-sheet-menu-container'> </div>\n    <div class='menu-container' id=\"es-function-menu-container\"> </div> \n    <div class='menu-container' id=\"es-style-menu-container\"> </div>\n    <div class='menu-container' id=\"es-activity-menu-container\"> </div>\n  </div>\n  <div id=\"es-panel-1\" class=\"es-panel\">\n    <div id=\"es-table-container\"></div>\n  </div>\n  <div id=\"es-modal-overlay\"><div id=\"es-modal-box\"></div></div>\n</div>\n");
module.exports['expression_editor'] = _.template("<textarea class=\"es-expression-editor-input\" type='text'></textarea>\n");
module.exports['function_menu'] = _.template("<ul id='es-menu-list'>\n<% _.each(eh.userFunctions,function(func){ %>\n  <% if(!func || !func.def){ return }; %>\n  <li class=\"es-menu-button\" data-action=<%= func.def %> > <%= func.def %> - <%= func.desc  %> </li>\n<% }); %>\n</ul>\n");
module.exports['import_dialog'] = _.template("<div id='es-modal-close'>[close]</div><h2>Import CSV</h2>\n<form action=\"/import/csv\" method=\"post\" enctype=\"multipart/form-data\">\n  <input type=\"file\" name=\"csv_file\"><input type='submit' value='Upload'>\n  <input type=\"hidden\" name=\"sheet_id\" value=\"<%=sheet_id%>\">\n</form>\n\n\n");
module.exports['menu'] = _.template("<ul id=\"es-menu-list\">\n  <li\n        id=\"es-menu-add-column\" \n        class=\"es-menu-button i18n\" \n        data-action=\"add_column\"\n        data-i18n=\"add_column\">\n  </li><li\n        id=\"es-menu-remove-column\"\n        class=\"es-menu-button i18n\" \n        data-action=\"remove_column\"\n        data-i18n=\"remove_column\">\n  </li><li\n        id=\"es-menu-add-row\" \n        class=\"es-menu-button i18n\" \n        data-action=\"add_row\"\n        data-i18n=\"add_row\">\n  </li><li\n        id=\"es-menu-remove-row\" \n        class=\"es-menu-button i18n\" \n        data-action=\"remove_row\"\n        data-i18n=\"remove_row\">\n  </li><li\n        id=\"es-menu-sort-rows\" \n        class=\"es-menu-button i18n\" \n        data-action=\"sort_row\"\n        data-i18n=\"sort_row\">\n  </li><li\n        id=\"es-menu-format-cell\"\n        class=\"es-menu-button i18n\" \n        data-action=\"format_cell\"\n        data-i18n=\"format_cell\">\n  </li>\n</ul>\n<div class='clear'></div>\n");
module.exports['sheet_list'] = _.template("<ul id='es-menu-list'>\n<% var _ = require('underscore'); %>\n<% var cls = \"\" %>\n<% sheets.each(function(sheet){ %>\n<li class=\"es-menu-button\" id=<%=sheet.id%> > \n  <span id=\"sheet_name\" style=\"float:left;padding-top:5px;\"><%=sheet.meta.title%> </span>\n  <form id=\"sheet_edit_form\" style=\"display:none;float:left;padding-top:5px;height:22px;width:155px;\">\n    <input id='sheet-name' type=\"text\" style=\"width: 145px; font-size: 16px; border: 1px solid #ccc;\" value=\"<%=sheet.meta.title%>\">\n    <input id='sheet-id' type=\"hidden\" value=\"<%=sheet.id%>\">\n  </form>\n  <button class=\"es-sheet-control\" id=\"delete-sheet\" data-sheet-id=\"<%=sheet.id%>\"><img src=\"/es_client/icons/es-trashcan.png\" height=16 width=16></button>\n  <button class=\"es-sheet-control\" id=\"rename-sheet\" data-sheet-id=\"<%=sheet.id%>\"><img src=\"/es_client/icons/es_pen.png\" height=16 width=16></button>\n  <div class=\"clear\"></div>\n</li>\n<%});%>\n</ul>\n<ul id='es-menu-grid'>\n<li id='es-add-sheet-button'><img src=\"/es_client/icons/ethersheet-icon-newtable.png\"><span class=\"i18n\" data-i18n=\"newSheet\"></span></li>\n<a href=\"/s/<%=current_sheet_id%>.csv\" target=_blank><li id=\"es-export-csv\"><img src=\"/es_client/icons/ethersheet-icon-export.png\"><span class=\"i18n\" data-i18n=\"exportCSV\"></span></li></a>\n<li id=\"es-import-csv\"><img src=\"/es_client/icons/ethersheet-icon-import.png\">Import CSV</li>\n</ul>\n");
module.exports['sheet_table'] = _.template("<div id=\"es-table-<%= id %>\" class=\"es-table-view\">\n  <table id=\"es-column-headers-<%=id%>\" class=\"es-column-headers es-table\">\n    <thead></thead>\n    <tbody></tbody>\n  </table>\n  <table id=\"es-row-headers-<%=id%>\" class=\"es-row-headers es-table\">\n    <thead></thead>\n    <tbody></tbody>\n  </table>\n  <div id=\"es-grid-container-<%= id %>\" class=\"es-grid-container\">\n    <table id=\"es-grid-<%= id %>\" class=\"es-grid es-table\">\n      <thead></thead>\n      <tbody id=\"es-data-table-<%=id%>\"></tbody>\n    </table>\n  </div>\n  <div class=\"es-table-corner\">\n    <div class=\"es-logo es-sidebar-toggle\">ES</div>\n  </div>\n</div>\n");
module.exports['table'] = _.template("<% var _ = require('underscore'); %>\n<% var clsAry = ['even','odd']; %>\n<% _.each(sheet.rowIds(), function(row_id,i){ %>\n<% if(i == 0){var cls = 'first'} else {var cls = clsAry[i % 2]} %>\n  <tr id=\"<%= row_id %>\" class=\"es-table-row es-row-<%= cls %>\" data-row_id=\"<%= row_id %>\" style=\"height:<%= sheet.getRowHeight(row_id) %>px;\">\n    <% if(i == 0) { %>\n      <% _.each(sheet.colIds(), function(col_id){ %>\n        <td id=\"<%= row_id %>-<%= col_id %>\" style=\"width:<%= sheet.getColWidth(col_id) %>px;\" class=\"<%= sheet.getCellFormatString(row_id,col_id) %>\" data-row_id=\"<%= row_id %>\" data-col_id=\"<%= col_id %>\" data-value=\"<%= sheet.getCellValue(row_id,col_id)%>\"><%= sheet.getCellDisplayById(row_id,col_id) %></td>\n      <% }) %>\n    <% } else { %>\n      <% _.each(sheet.colIds(), function(col_id){ %>\n        <td id=\"<%= row_id %>-<%= col_id %>\" class=\"<%= sheet.getCellFormatString(row_id,col_id) %>\" data-row_id=\"<%= row_id %>\" data-col_id=\"<%= col_id %>\" data-value=\"<%= sheet.getCellValue(row_id,col_id)%>\"><%= sheet.getCellDisplayById(row_id,col_id) %></td>\n      <% }) %>\n    <% } %>\n  </tr>\n<% }) %>\n");
var templateWrapper = function(template){
  return function(data){
    data = data || {};
    data.require = require;
    return template(data);
  }
};
for(i in module.exports) module.exports[i] = templateWrapper(module.exports[i]);

});
