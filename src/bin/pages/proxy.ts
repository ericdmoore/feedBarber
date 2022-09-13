import type { ASTComputable, PromiseOr } from '../../types.ts';
import { json, sift } from '../../mod.ts';
// import { jsonToComputable } from '../../lib/parsers/ast.ts'
import { fetchAndValidateIntoAST } from '../../lib/start.ts';

import respondAs from '../utils/respondAs.ts';
import { readToString, stringToStream } from '../../lib/utils/pumpReader.ts';
import { type FuncInterface, functions } from '../../lib/parsers/enhancementFunctions.ts';
import funcMap from '../../lib/enhancements/index.ts';
import er from '../../lib/parsers/helpers/error.ts';

type Handler = sift.Handler;

export type Dict<T> = { [key: string]: T };
export type ASTChainFunc = (i: PromiseOr<ASTComputable>) => Promise<ASTComputable>;

const applyPipeline = (ast: ASTComputable, ...chainFuncs: ASTChainFunc[]) => {
	return chainFuncs.reduce(
		 (ast, f, i) => {
			try {
				return f(ast);
			} catch (e) {
				console.log(i, e);
				// undo and move on ...
				return ast;
			}
		},
		Promise.resolve(ast),
	) as Promise<ASTComputable>;
};

const setupAstPipeline = (ast: ASTComputable, funcParms: FuncInterface[]): Promise<ASTComputable> => {
	// import the name
	// apply the params
	// and invoke thunk
	const chainFuncs = funcParms.map((fi, i) => {
		// @todo blow out this directory
		// integrate with npm?
		// make a developer user name lookup
		// use raw urls?
		if (funcMap?.[fi.fname]) {
			return funcMap[fi.fname].run(fi.params) as ASTChainFunc;
		} else {
			funcParms[i].errors = [
				...(funcParms[i].errors ?? []),
				'Could not locate this function, so it has been omited from the results',
			];
			return null;
		}
	}).filter((f: ASTChainFunc | null) => f as ASTChainFunc) as ASTChainFunc[];

	return applyPipeline(ast, ...chainFuncs).catch((e) => {
		console.error(e);
		return Promise.reject(er(e, `An Error Occured occured on the CityTrain - please look at ${e}`, new Error().stack));
	});
};

export const proxy: Handler = async (_, params): Promise<Response> => {
	// find/parse funcs
	const funcs = await functions.parse()(params?.composition ?? 'hash');

	const funcInt = funcs.right as FuncInterface[];

	const ast = await setupAstPipeline(
		await fetchAndValidateIntoAST({ url: params?.url ?? '' }),
		funcInt,
	);

	const respAs = await respondAs(params?.outputFmt ?? 'json', { ast, url: params?.url ?? '' });

	// respond sometimes XML, sometimes JSON
	if (respAs.headers.get('Content-Type')?.match('xml')) {
		return respAs;
	} else {
		const s = await readToString(respAs.body ?? stringToStream('{}'));
		const body = JSON.parse(s) as Record<string, unknown>;

		return json({
			_reflect: { params, funcs },
			...body,
		}, { status: 200 });
	}
};

export default proxy;
