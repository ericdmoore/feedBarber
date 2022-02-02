.PHONY: start fmt test list

list:
	@echo "\nAvailable make commands:\n"
	@LC_ALL=C $(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$'
	@echo "\n"
test:
	deno test -j=3 --coverage=.cov --import-map=src/import_map.json ./src/tests/* ./src/tests/**/*

server:
	deno run --allow-net --allow-env ./src/bin/handler.ts

start:
	deno run --allow-net --import-map=./src/import_map.json src/lib/start.ts

fmt:
	deno fmtmake 