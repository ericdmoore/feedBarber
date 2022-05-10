.PHONY: start fmt test list cli server scratch ls cov
covDir = .cov
lcovFile = lines.lcov

ls: list

list:
	@echo "\nAvailable make commands:\n"
	@LC_ALL=C $(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$'
	@echo "\n"


test:
	rm -rf .cov;
	rm -rf .nyc_output;
	deno test -j=3 --coverage=.cov ./tests/**/*

cov:
	deno coverage $(covDir) --lcov --output=.nyc_output/$(lcovFile) ;
	genhtml -o .nyc_output/html .nyc_output/$(lcovFile) ; 
	open .nyc_output/html/index.html ;


server:
	open http://localhost:8000; deno run --allow-net --allow-env ./src/bin/handler.tsx


start:
	deno run --allow-net src/bin/go.ts


cli:
	deno run --allow-net src/bin/cli.ts


fmt:
	deno fmt 


scratch:
	deno run --allow-net _sratch/discover.ts