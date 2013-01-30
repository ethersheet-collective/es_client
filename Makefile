test-webkit: templates
	phantomjs test/phantom-mocha.js test/phantom.html
test-node: templates
	./node_modules/.bin/mocha -R spec -r chai test/unit/*.js 
templates:
	./bin/build_templates.js
todo:
	grep -rn 'TODO' *.js helpers lib models styles test views templates

.PHONY: test-webkit test-node templates todo
