// deno-lint-ignore no-unused-vars
import skip from '../../helpers.ts';
import { txtorCData } from '../../../src/lib/parsers/helpers/composedPrimitives.ts';
import { assertEquals } from '../../../src/mod.ts';

Deno.test('Pick Inner Text', async () => {
	const actual = txtorCData('bad', { _text: 'Pick Me' });
	const expected = 'Pick Me';
	assertEquals(actual, expected);
});

Deno.test('Pick Inner Text or CData', async () => {
	const actual = txtorCData('bad', { _cdata: 'Now Pick Me' });
	const expected = 'Now Pick Me';
	assertEquals(actual, expected);
});

Deno.test('Prefer Inner Text to CData', async () => {
	const actual = txtorCData('bad', { _cdata: 'CDATÀ', _text: 'Winner' });
	const expected = 'Winner';
	assertEquals(actual, expected);
});
