import { skip } from '../helpers.ts';
import { jsonFeed as jsf } from '../mocks/jsonFeed/daringFireball.ts';
import { parseAndValidate } from '../../src/lib/start.ts';
import { computableToJson } from '../../src/lib/parsers/ast.ts';
import { JsonFeed, RespStruct  } from '../../src/lib/parsers/jsonFeed.ts';
import { assertEquals } from 'https://deno.land/std@0.123.0/testing/asserts.ts';

Deno.test(skip(
	'JsonFeed -> AST -> JsonFeed',
	async () => {
		const fakeUrl = 'http://world.hey.com/dhh/sitemap.xml';
		const c1 = await parseAndValidate({ txt: jsf, url: fakeUrl });
		const ast = await JsonFeed(c1.data, fakeUrl).toAST();
		const astJson = await computableToJson(ast);
		const c2 = await JsonFeed<RespStruct>({}, fakeUrl).fromAST(astJson);
		assertEquals(c1.data, c2);
	},
));

Deno.test(skip(
	'JsonFeed -> AST -> Rss',
	async () => {
	},
));

Deno.test(skip(
	'JsonFeed -> AST -> Atom',
	async () => {
	},
));
