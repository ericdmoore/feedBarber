import { skip } from '../helpers.ts';
import { atom as dhhAtom } from './mocks/dhh_hey.ts';
import { parseAndValidate } from '../../lib/start.ts';
import { computableToJson } from '../../lib/parsers/ast.ts';
import { Atom, RespStruct as atomStruct } from '../../lib/parsers/atom.ts';
import { assertEquals } from 'https://deno.land/std@0.123.0/testing/asserts.ts';

Deno.test(skip(
	'Rss -> AST -> Rss',
	async () => {
		const fakeUrl = 'https://world.hey.com/dhh/atom.xml';
		const c1 = await parseAndValidate(dhhAtom, fakeUrl) as unknown as atomStruct;
		const ast = await Atom(c1, fakeUrl).toAST();
		const astJson = await computableToJson(ast);
		const c2 = await Atom({}, fakeUrl).fromAST(astJson) as atomStruct;
		assertEquals(c1, c2);
	},
));

Deno.test(skip(
	'Rss -> AST -> Atom',
	async () => {
	},
));

Deno.test(skip(
	'Rss -> AST -> JsonFeed',
	async () => {
	},
));
