if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var expect = require('chai').expect;
var should = require('chai').should();
var $ = require('jquery');

var Sheet = require('es_client/models/sheet');
var SheetCollection = require('es_client/models/sheet_collection');
var SelectionCollection = require('es_client/models/selection_collection');
var TableView = require('es_client/views/table');
var ES = require('es_client/config');

// setup dom attachment point
var $container = $('<div id="ethersheet-container" style="display:none;"></div').appendTo('body');

describe('TableView', function(){

  var table, $el, sheet, selections;

  var initializeTable = function(){
    $container.empty()
    $el = $('<div id="ethersheet"></div>').appendTo($container);

    sheets = new SheetCollection();
    sheet = new Sheet();
    sheets.add(sheet);
    selections = new SelectionCollection([],{sheet_collection:sheets});
    selections.createLocal();
    selection = selections.getLocal();
    selections.add(selection);

    table = new TableView({
      el: $el,
      sheet: sheet,
      selections: selections
    });
    table.render();
  }

  describe('by default, it should create a blank 20x100 table display', function(){
    before(function(){
      initializeTable();
    });

    it('should render a table', function(){
      $('#ethersheet table').length.should.not.be.empty;
    });

    it('should have the right number of cells', function(){
      var expected_cell_count = ES.DEFAULT_ROW_COUNT * ES.DEFAULT_COL_COUNT;
      $('#ethersheet .es-table-cell').length.should.equal(expected_cell_count);
    });

    it('should have the right number of rows', function(){
      $('#ethersheet .es-table-row').length.should.equal(ES.DEFAULT_ROW_COUNT);
    });

    it('should have the right column headers', function(){
      $('#ethersheet .column-header').length.should.equal(ES.DEFAULT_COL_COUNT);
      $("#ethersheet .column-header").last().text().should.equal('T');
    });

    it('should have the right row headers', function(){
      $('#ethersheet .row-header').length.should.equal(ES.DEFAULT_ROW_COUNT)
      $("#ethersheet .row-header").last().text().should.equal('100');
    });
    it('should have empty cells', function(){
      $('td',$el).each(function(){
        $(this).text().should.equal('');
      });
    });
  });
  
  describe('should respond to sheet events', function(){
    var row_id, col_id, value;

    beforeEach(function(){
      initializeTable();
      value = 5;
      row_id = sheet.rowAt(0);
      col_id = sheet.colAt(0);
    });
    describe('on update cell', function(){
      it('should update the table display of the cell',function(){
        sheet.updateCell(row_id,col_id,'=1+1');
        $('.es-table-cell',$el).first().text().should.equal('=1+1'); 
      });

      it('should update the formula editor display for the cell');
    }); 

    describe('on commit cell', function(){
      it('should update the table display with the new cell value',function(){
        sheet.updateCell(row_id,col_id,'=1+1');
        sheet.commitCell(row_id,col_id);
        $('.es-table-cell',$el).first().attr('data-value').should.equal('2'); 
      });
      it('should update th formula display with the new display formula');
    });
    describe('on insert_col', function(){
      it('should draw a new column', function(){
        var original_col_count = $('.es-table-row',$el)
                              .first()
                              .find('.es-table-cell')
                              .length;
        sheet.insertCol(0);
        var new_col_count = $('.es-table-row',$el)
                              .first()
                              .find('.es-table-cell')
                              .length;
        new_col_count.should.equal(original_col_count + 1);
      });

      it('should draw values in correct location', function(){
        sheet.updateCell(row_id,col_id,value);
        sheet.commitCell(row_id,col_id);
        sheet.insertCol(0);
        
        $('.es-table-cell',$el)
        .eq(0)
        .text()
        .should.equal(''); 
        
        $('.es-table-cell',$el)
        .eq(1)
        .text()
        .should.equal(value.toString()); 
      });
    });
    describe('on delete_col', function(){
      it('should remove a column', function(){
        var original_col_count = $('.es-table-row',$el)
                              .first()
                              .find('.es-table-cell')
                              .length;
        sheet.deleteCol(sheet.colAt(0));
        var new_col_count = $('.es-table-row',$el)
                              .first()
                              .find('.es-table-cell')
                              .length;
        new_col_count.should.equal(original_col_count - 1);
      });

      it('should draw values in correct location', function(){
        row_id = sheet.rowAt(0);
        col_id = sheet.colAt(1);
        sheet.updateCell(row_id,col_id,value);
        sheet.commitCell(row_id,col_id);
        sheet.deleteCol(sheet.colAt(0));
        
        $('.es-table-cell',$el)
        .eq(0)
        .text()
        .should.equal(value.toString()); 
        
        $('.es-table-cell',$el)
        .eq(1)
        .text()
        .should.equal(''); 
      });
    });
    describe('on insert_row', function(){
      it('should draw a new row', function(){
        var original_row_count = $('.es-table-row',$el)
                              .length;
        sheet.insertRow(0);
        var new_row_count = $('.es-table-row',$el)
                              .length;
        new_row_count.should.equal(original_row_count + 1);
      });

      it('should draw values in correct location', function(){
        sheet.updateCell(row_id,col_id,value);
        sheet.commitCell(row_id,col_id);
        sheet.insertRow(0);
        
        $('.es-table-cell',$el)
        .eq(0)
        .text()
        .should.equal(''); 
        
        $('.es-table-row',$el)
        .eq(1)
        .find('.es-table-cell')
        .eq(0)
        .text()
        .should.equal(value.toString()); 
      });
    });
    
    describe('on delete_row', function(){
      it('should draw a new row', function(){
        var original_row_count = $('.es-table-row',$el)
                              .length;
        sheet.deleteRow(sheet.rowAt(0));
        var new_row_count = $('.es-table-row',$el)
                              .length;
        new_row_count.should.equal(original_row_count - 1);
      });

      it('should draw values in correct location', function(){
        row_id = sheet.rowAt(1);
        col_id = sheet.colAt(0);
        sheet.updateCell(row_id,col_id,value);
        sheet.commitCell(row_id,col_id);
        sheet.deleteRow(sheet.rowAt(0));
        
        $('.es-table-cell',$el)
        .eq(0)
        .text()
        .should.equal(value.toString()); 
        
        $('.es-table-row',$el)
        .eq(1)
        .find('.es-table-cell')
        .eq(0)
        .text()
        .should.equal(''); 
      });
    });


  });

  describe("when a cell is clicked", function(){
    var initial_bgcolor, $clicked_cell, $input;
    beforeEach(function(){
      initializeTable();
      row_id = sheet.rowAt(0);
      col_id = sheet.colAt(0);
      value = '=1+1';
      sheet.updateCell(row_id,col_id,value);
      sheet.commitCell(row_id,col_id);
      $clicked_cell = $('.es-table-cell').first()
      initial_bgcolor = $clicked_cell.css('background-color');
      $clicked_cell.click()
      $input = $('#'+$clicked_cell.attr('id')+'-input');
    });

    it("should create a selection", function(){
      var cells = selections.getLocal().getCells();
      cells.length.should.equal(1);
      cells[0].col_id.should.equal(sheet.colAt(0));
      cells[0].row_id.should.equal(sheet.rowAt(0));
      cells[0].sheet_id.should.equal(sheet.id);
    });
    
    it("should highlight selected cell", function(){
      var bgcolor = $clicked_cell.css('background-color');
      bgcolor.should.not.equal(initial_bgcolor);
    });

    it("should create an input for selected cell", function(done){
      $input[0].should.not.equal(undefined);
      $input.val().should.equal(value);
      done();
    });

    describe("and then a new cell is clicked", function(){
      var $new_cell;
      beforeEach(function(){
        $new_cell = $('.es-table-cell').last();
        $new_cell.click();
      });

      it("should unhighlight original cell", function(){
        var new_bgcolor = $clicked_cell.css('background-color');
        new_bgcolor.should.equal(initial_bgcolor);
      });

      it("should remove the old input", function(){
        $input = $('#'+$clicked_cell.attr('id')+'-input');
        $input.length.should.equal(0);
      });
    });

    describe("when a user edits a cell", function(){
      var row_id, col_id, initial_val;
      
      beforeEach(function(){
        row_id = $clicked_cell.data("row_id").toString();
        col_id = $clicked_cell.data("col_id").toString();
        initial_val = sheet.getCellDisplay(sheet.getCell(row_id, col_id));
        sheet.updateCell(row_id,col_id,'new_text');
        $input.val('new text');
        $input.trigger('change');
      });

      it("should change the value of the cell", function(done){
        var new_val = sheet.getCellDisplay(sheet.getCell(row_id, col_id));
        new_val.should.not.equal(initial_val);
        done();
      });

      it("should call sheet#updateCell", function(done){
        var called = false;
        sheet.updateCell = function(){
          called = true;
        }
        $input.val('text');
        $input.trigger('keyup');
        called.should.be.true
        done();
      });

    });

    describe("When a user finishes editing a cell", function(){
      it("should call Sheet#CommitCell()", function(){
        var called = false;
        sheet.commitCell = function(){
          called = true;
        }
        $input.val('text');
        $input.trigger('change');
        called.should.be.true
      });

      it("should move selection to the next cell", function(done){
        var e = $.Event("keypress");
        e.which = 13; 
        e.keyCode = 13;
        $('#'+$clicked_cell.attr('id')+'-input').length.should.equal(1);
        $input.trigger(e);
        $('#'+$clicked_cell.attr('id')+'-input').length.should.equal(0);
        $newCell = $('td#1-0');
        $input = $('#'+$newCell.attr('id')+'-input');
        $input.length.should.equal(1);
        done();
      });

      it("should have the parsed value", function(){
        $clicked_cell.text().should.equal('2');
      });
    });

  });

});

});
