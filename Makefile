test:
	./node_modules/.bin/mocha -R spec -r chai test/unit/*.js 
test-webkit:
	phantomjs test/phantom-mocha.js http://localhost:8080/es_client/test/

.PHONY: test test-webkit
