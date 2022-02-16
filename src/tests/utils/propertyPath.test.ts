// deno-lint-ignore no-unused-vars
import skip from '../helpers.ts';
import { assertEquals } from 'https://deno.land/std@0.123.0/testing/asserts.ts';
import { getPath, setPath } from '../../lib/utils/propertyPath.ts'

Deno.test('getPath - Basic Object', async () => {
	const actual = getPath('a.b.c.d', {a:{b:{c:{d:true}}}});
	const expected = true;
	assertEquals(actual, expected);
});

Deno.test('getPath - Basic Array', async () => {
	const actual = getPath('a.1.e.with', {a:[ {b:2}, {c:3, d:4, e:{with: '5'}}]} );
	const expected = '5';
	assertEquals(actual, expected);
});

Deno.test('Simple Path Miss', async () => {
	const actual = getPath('a.e', {a:{b:{c:{d:true}}}});
	const expected = undefined;
	assertEquals(actual, expected);
});

Deno.test('getPath - Long Path Miss', async () => {
	const actual = getPath('a.e.c.d', {a:{b:{c:{d:true}}}});
	const expected = undefined;
	assertEquals(actual, expected);
});

Deno.test('setPath - Object', async () => {
	const actual = setPath('a.1.e.with', null, {a:[ {b:2}, {c:3, d:4, e:{with: '5'}}]} );
	const expected = {a:[ {b:2}, {c:3, d:4, e:{with: null}}]}
	assertEquals(actual, expected);
});

Deno.test('setPath - in an Array', async () => {
	const actual = setPath('a.0', null, {a:[ {b:2}, {c:3, d:4, e:{with: '5'}}]} );
	const expected = {a:[ null, {c:3, d:4, e:{with: '5'}}]}
	assertEquals(actual, expected);
});