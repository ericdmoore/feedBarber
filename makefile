.PHONY: start fmt

start:
	deno run --allow-net src/lib/start.ts
fmt:
	deno fmt