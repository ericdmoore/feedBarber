.PHONY: start fmt test

start:
	deno run --allow-net --import-map=./src/import_map.json src/lib/start.ts
fmt:
	deno fmt
test:
	deno test -j=3 --coverage=.cov --import-map=src/import_map.json ./src/tests/* ./src/tests/**/*