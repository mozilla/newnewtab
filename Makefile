REPORTER = dot
INTERFACE = bdd

test:
	@./node_modules/.bin/mocha --reporter $(REPORTER) --ui $(INTERFACE)

.PHONY: test
