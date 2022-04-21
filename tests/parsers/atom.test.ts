import { skip } from '../helpers.ts';
import { atom as dhhAtom } from '../mocks/atom/dhh_hey.ts';
import { parseAndValidate } from '../../src/lib/start.ts';
import { computableToJson } from '../../src/lib/parsers/ast.ts';
import { Atom, RespStruct as atomStruct } from '../../src/lib/parsers/atom.ts';
import { assertEquals } from 'https://deno.land/std@0.123.0/testing/asserts.ts';

Deno.test(
	'Atom -> AST -> Atom',
	async () => {
		console.log();
		const fakeUrl = 'http://world.hey.com/dhh/atom.xml';

		const a1 = await parseAndValidate({ url: fakeUrl, txt: dhhAtom });
		const ast = await Atom(a1, fakeUrl).toAST();
		console.log('ast:', ast);

		const astJson = await computableToJson(ast);
		console.log('astJson:', astJson);

		const a2 = await Atom({}, fakeUrl).fromAST(astJson) as atomStruct;
		console.log('a2:', a2);

		assertEquals(a1.data, a2);
	},
);

Deno.test(skip(
	'Atom -> AST -> Rss',
	async () => {
		const fakeUrl = 'http://world.hey.com/dhh/atom.xml';
		const cAtom1 = await parseAndValidate({ txt: dhhAtom, url: fakeUrl }) as unknown as atomStruct;
		const ast = await Atom(cAtom1, fakeUrl).toAST();
		const astJson = await computableToJson(ast);
		const cAtom2 = await Atom({}, fakeUrl).fromAST(astJson) as atomStruct;
		assertEquals(cAtom1, cAtom2);
	},
));

Deno.test(skip(
	'Atom -> AST -> JsonFeed',
	async () => {
	},
));
