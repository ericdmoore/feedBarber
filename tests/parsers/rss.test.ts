import { skip } from '../helpers.ts';
import { atom as dhhAtom } from '../mocks/dhh_hey.ts';
import { parseAndValidate } from '../../src/lib/start.ts';
import { computableToJson } from '../../src/lib/parsers/ast.ts';
import { Rss, RespStruct as atomStruct } from '../../src/lib/parsers/rss.ts';
import { assertEquals } from 'https://deno.land/std@0.123.0/testing/asserts.ts';

Deno.test(skip(
	'Rss -> AST -> Rss',
	async () => {
		const fakeUrl = 'https://world.hey.com/dhh/rss.xml';
		const c1 = await parseAndValidate({ url: fakeUrl, txt: dhhAtom });
		const ast = await Rss(c1.data, fakeUrl).toAST();
		const astJson = await computableToJson(ast);
		const c2 = await Rss({}, fakeUrl).fromAST(astJson) as atomStruct;
		assertEquals(c1, c2);
	},
));

Deno.test(skip(
	'Rss -> AST -> Atom', async () => {},
));

Deno.test(skip( 'Rss -> AST -> JsonFeed',async () => {} ));
