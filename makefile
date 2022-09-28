.PHONY: start fmt test list cli server scratch ls cov

# sync this with the vars in the `local_db_avail.sh` file
URL = "https://s3.eu-central-1.amazonaws.com/dynamodb-local-frankfurt/dynamodb_local_latest.tar.gz"
DIR = "./dynamodb_local_latest"
covDataDir = .cov
covRptDir = cov_profile
lcovFile = deno.lcov
dynamoDBFile = shared-local-instance.db
useParallel = --parallel

ls: list

list:
	@echo "\nAvailable make commands:\n"
	@LC_ALL=C $(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$'
	@echo "\n"

test: test_ci fmt lint
tests: test	

test_ci:
	DENO_JOBS=3 deno test --allow-read=./,${PWD},./src/lib/utils/,./tests/enhancements/ --allow-net --allow-env --coverage=$(covDataDir) --parallel ./tests/**/*

test-reload: 
	DENO_JOBS=3 deno test --allow-read --allow-net --allow-env --coverage=$(covDataDir) --parallel --reload ./tests/**/*

coverage_prev_clear:
	rm -f ${dynamoDBFile}
	rm -rf ${covDir}
	rm -rf ${covRptDir}

cov:
	deno coverage $(covDataDir) --lcov --output=$(covDataDir)/$(lcovFile) ;

coverage: coverage_prev_clear wait5 test cov
	genhtml -o ${covRptDir}/html $(covDataDir)/$(lcovFile);
	open ${covRptDir}/html/index.html

server:
	open http://localhost:8000; denon run --allow-net --allow-env ./src/bin/httpHandler.tsx

start:
	deno run --allow-net src/bin/go.ts

cli:
	deno run --allow-net src/bin/cli.ts

fmt-check:
	deno fmt ./src/lib ./src/bin ./tests --check

fmt:
	deno fmt ./src/lib ./src/bin ./tests

lint:
	deno lint ./src/lib ./src/bin ./tests --json | jq '[.diagnostics[].file] | unique'

scratch:
	deno run --allow-net _sratch/discover.ts
