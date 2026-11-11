555gg5REPORTER = spec
MOCHA = node_modules/.bin/mocha

test:
	@NODE_ENV=test $(MOCHA) --require should --reporter $(REPORTER)

test-colors:
	@NODE_ENV=test $(MOCHA) --require should --reporter $(REPORTER) --colors

publish:
	@npm version patch -m "version bump"
	@npm publish

.PHONY: test test-colors publish doc
