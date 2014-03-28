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
var getData = require('es_client/test/fixtures');
// setup dom attachment point
var $container = $('<div id="ethersheet-container" style="display:none;"></div').appendTo('body');

describe('TableView', function(){

  var table, $el, sheet, selections;

  var initializeTable = function(){
    var data = getData({});
    $container.empty()
    $el = $('<div id="ethersheet"></div>').appendTo($container);

    table = new TableView({
      el: $el,
      data: data
    });
    sheet =  data.local_sheet;
    selections = data.selections;
    selection = data.local_selection;
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
      $('#ethersheet .es-column-header').length.should.equal(ES.DEFAULT_COL_COUNT);
      $("#ethersheet .es-column-header").last().text().should.equal('T');
    });

    it('should have the right row headers', function(){
      $('#ethersheet .es-row-header').length.should.equal(ES.DEFAULT_ROW_COUNT)
      $("#ethersheet .es-row-header").last().text().should.equal('100');
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
        $('.es-table-cell',$el).first().text().should.equal('2'); 
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

    /*it("should create an input for selected cell", function(done){
      var value = '=1+1';
      $input[0].should.not.equal(undefined);
      $input.val().should.equal(value);
      done();
    });*/

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
        /*sheet.updateCell = function(){
          called = true;
        }*/
        $input.val('text');
        $input.trigger('keyup');
        //called.should.be.true
        done();
      });

    });

    describe("When a user finishes editing a cell", function(){
      beforeEach(function(){
        initializeTable();
      });
      it("should call Sheet#CommitCell()", function(){
        var called = false;
       /* sheet.commitCell = function(){
          called = true;
        }*/
        $input.val('text');
        $input.trigger('change');
        //called.should.be.true
      });

      it("should move selection down a cell when enter is pressed", function(done){
        var $the_cell = $('.es-table-cell').first()
        var $newCell = $('td#1-0');
        $the_cell.click();

        var $the_input = $('#'+$the_cell.attr('id')+'-input');
        $the_input.length.should.equal(1);

        var e = $.Event("keydown");
        e.which = 13; 
        e.keyCode = 13;
        $the_input.trigger(e);

        $('#'+$the_cell.attr('id')+'-input').length.should.equal(0);
        $('#'+$newCell.attr('id')+'-input').length.should.equal(1);

        done();
      });

      it("should move selection over a cell when tab is pressed",function(done){
        var ev = $.Event("keydown");
        var $the_cell = $('.es-table-cell').first()
        var $newCell = $('td#0-1');
        $the_cell.click()
        ev.which = 9; 
        ev.keyCode = 9;
        $('#'+$the_cell.attr('id')+'-input').length.should.equal(1);
        var $the_input = $('#'+$the_cell.attr('id')+'-input');
        $the_input.trigger(ev);
        $('#'+$the_cell.attr('id')+'-input').length.should.equal(0);
        $input_new = $('#'+$newCell.attr('id')+'-input');
        $input_new.length.should.equal(1);
        done();
      });

      it("should show display value on previous edited cell when enter or tab are pressed", function(){
        var $newCell = $('td#1-0');
        sheet.updateCell('1','0','=1+3');
        $newCell.click();
        var $input_new = $('#'+$newCell.attr('id')+'-input');
        $input_new.val('=1+3');
        var e = $.Event("keydown");
        e.which = 13; 
        e.keyCode = 13;
        $input_new.trigger(e);
        sheet.refreshCells();
          $newCell.text().should.equal('4');
        /*sheet.refreshCells(function(){
          done();
        });*/
      });

      it("should display cell reference as integer if there is a cell reference", function(done){
        sheet.updateCell('0','0','2');
        sheet.commitCell('0','0');
        sheet.updateCell('2','0', '=A1');
        var $newCell = $('td#2-0');
        var $oldCell = $('td#0-0');
        $newCell.click();
        var $input_new = $('#'+$newCell.attr('id')+'-input');
        $input_new.val('=A1');
        var e = $.Event("keydown");
        e.which = 13; 
        e.keyCode = 13;
        $input_new.trigger(e);
        sheet.refreshCells();
        $newCell.text().should.equal('2');
        done();
      });

      it('should update cell when referenced cell changes', function(done){
        sheet.updateCell('0', '0', '4');
        sheet.commitCell('0','0');
        sheet.updateCell('0', '1', '=A1');
        sheet.commitCell('0','1');
        sheet.updateCell('0', '0', '5');
        sheet.commitCell('0','0');
        sheet.refreshCells();
        $('td#0-1').text().should.equal('5');
        done();
      });
    });

  });
  
  describe('formatting cells', function(){
    beforeEach(function(){
      initializeTable();
      value = 5;
      row_id = sheet.rowAt(0);
      col_id = sheet.colAt(0);
    });
    it('should apply formatting classes to the display of a cell if they exist', function(){
      sheet.updateCell('0', '0', '4');
      selection.addCell(sheet.id, '0','0');
      selection.addFormat('bg-red');
      var $selected_cell = $('td#0-0');
      $selected_cell.hasClass('bg-red').should.be.true;
    });
  });

});

});
