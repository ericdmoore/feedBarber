import type { ASTJson } from '../../types.ts';

import { Handler, json } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import { fetchAndValidateIntoAST } from '../../lib/start.ts';
import parseFuncs from '../../lib/parsers/enhancementFunctions.ts';
import respondAs from '../utils/respondAs.ts';
import pumpReader from '../utils/pumpReader.ts';

export const proxy: Handler = async (_, params): Promise<Response> => {
	const ast: ASTJson = await fetchAndValidateIntoAST({ url: params?.url ?? '' });
	// console.log({ast})

	const respAs = await respondAs(
		params?.outputFmt ?? 'json',
		{ ast, url: params?.url ?? '' },
	);

	if (respAs.headers.get('Content-Type')?.match('xml')) {
		return respAs;
	} else {
		// console.log('not xml')
		const s = await pumpReader(respAs.body);
		// console.log({s, respAs})
		return json({
			_reflect: {
				params,
				funcs: parseFuncs(params?.composition ?? ''),
			},
			...(JSON.parse(s) as Record<string, unknown>),
		}, { status: 200 });
	}
};
export default proxy;
