REPORTER = spec
MOCHA = node_modules/.bin/mocha

test:
	@NODE_ENV=test $(MOCHA) --require should --reporter $(REPORTER)

test-colors:
	@NODE_ENV=test $(MOCHA) --require should --reporter $(REPORTER) --colors

build:
	@npm run build

typecheck:
	@npm run typecheck

publish:
	@npm version patch -m "version bump"
	@npm publish

.PHONY: test test-colors build typecheck publish
