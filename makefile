.PHONY: start fmt test list cli server scratch ls cov
covDir=.cov
covOutput=.nyc_output
lcovFile=lines.lcov

ls: list

list:
	@echo "\nAvailable make commands:\n"
	@LC_ALL=C $(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$'
	@echo "\n"


test:
	rm -rf $(covDir);
	rm -rf $(covOutput);
	mkdir $(covDir)
	mkdir $(covOutput)
	deno test --allow-read --allow-net --allow-env --coverage=$(covDir) -j=3 ./tests/**/*

cov:
	deno coverage $(covDir) --lcov --output=$(covOutput)/$(lcovFile) ;

reportCov:
	genhtml -o $(covOutput)/html $(covOutput)/$(lcovFile) ; 
	open $(covOutput)/html/index.html ;


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