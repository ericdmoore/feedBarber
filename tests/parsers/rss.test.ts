import { skip } from '../helpers.ts';
import { rss as danLuuRss } from '../mocks/rss/danluu.ts';
import { parseAndValidate } from '../../src/lib/start.ts';
import { computableToJson } from '../../src/lib/parsers/ast.ts';
import { Rss, RespStruct } from '../../src/lib/parsers/rss.ts';
import { assertEquals } from '../../src/mod.ts';

Deno.test(skip(
	'Rss -> AST -> Rss',
	async () => {
		const fakeUrl = 'https://world.hey.com/dhh/rss.xml';
		const c1 = await parseAndValidate({ url: fakeUrl, txt: danLuuRss });
		const ast = await Rss(c1.data, fakeUrl).toAST();
		const astJson = await computableToJson(ast);
		const c2 = await Rss<RespStruct>({}, fakeUrl).fromAST(astJson);
		assertEquals(c1.data, c2);
	},
));

Deno.test(skip(
	'Rss -> AST -> Atom', async () => {},
));

Deno.test(skip( 'Rss -> AST -> JsonFeed',async () => {} ));
