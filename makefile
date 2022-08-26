.PHONY: start fmt test list cli server scratch ls cov

# sync this with the vars in the `local_db_avail.sh` file
URL = "https://s3.eu-central-1.amazonaws.com/dynamodb-local-frankfurt/dynamodb_local_latest.tar.gz"
DIR = "./dynamodb_local_latest"
covDataDir = .cov
covRptDir = cov_profile
lcovFile = _lines.lcov
dynamoDBFile = shared-local-instance.db

ls: list

list:
	@echo "\nAvailable make commands:\n"
	@LC_ALL=C $(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$'
	@echo "\n"

test: 
	deno test --allow-read=.,./src/lib/utils/ --allow-net --allow-env --coverage=$(covDataDir) -j=3 ./tests/**/*

tests: test
	
cov:
	deno coverage $(covDataDir) --lcov --output=$(covDataDir)/$(lcovFile) ;

coverage_prev_clear:
	rm -f ${dynamoDBFile}
	rm -rf ${covDir}
	rm -rf ${covRptDir}

coverage: coverage_prev_clear local_db_start wait5 test cov
	genhtml -o cov_profile/html .coverage/_deno.lcov;
	open cov_profile/html/index.html

local_dl:
	./local_db_avail.sh $(DIR) $(URL)

local_db_start:
	java -D"java.library.path=$(DIR)/DynamoDBLocal_lib" -jar "$(DIR)/DynamoDBLocal.jar" -sharedDb &

local_db_stop:
	pkill java

wait5:
	sleep 5.1

local_tests: local_db_start wait5 tests local_db_stop

server:
	open http://localhost:8000; denon run --allow-net --allow-env ./src/bin/httpHandler.tsx

start:
	deno run --allow-net src/bin/go.ts

cli:
	deno run --allow-net src/bin/cli.ts

fmt:
	deno fmt 

scratch:
	deno run --allow-net _sratch/discover.ts



