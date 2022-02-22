.PHONY: start fmt test list cli server scratch

list:
	@echo "\nAvailable make commands:\n"
	@LC_ALL=C $(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$'
	@echo "\n"

test:
	deno test -j=3 --coverage=.cov ./src/tests/**/*

server:
	open http://localhost:8000; deno run --allow-net --allow-env ./src/bin/handler.ts

start:
	deno run --allow-net src/bin/go.ts

cli:
	deno run --allow-net src/bin/cli.ts

fmt:
	deno fmt 

scratch:
	deno run --allow-net _sratch/discover.ts