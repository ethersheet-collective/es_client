function setupTestDisplay($){
  $('<a id="test-toggle">')
  .css({
    top:0,
    left:0,
    cursor:'pointer',
    font:'12px monaco',
    position: 'fixed',
    background: 'white',
    'box-shadow': '1px 1px 18px white',
    padding: '0 7px 3px 4px',
    'border-radius': '0 0 6px 0'
  })
  .click(function(){
    var $mocha = $('#mocha');
    var $es = $('#ethersheet-container');
    var $styles = $('#mocha-styles');
    if($mocha.css('display')=='none'){
      $es.hide();
      $styles.attr('rel','stylesheet');
      $mocha.show();
      $(this).html('[X] Display Tests');
    } else {
      $mocha.hide();
      $styles.attr('rel','disabled');
      $es.show();
      $(this).html('[ ] Display Tests');
    } 
  })
  .text('[X] Display Tests')
  .prependTo('body')
};
