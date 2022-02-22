import type { Handler  } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import type { PromiseOr, ASTComputable } from '../../types.ts';

import { json } from 'https://deno.land/x/sift@0.4.3/mod.ts';

import { computableToJson, jsonToComputable } from '../../lib/parsers/ast.ts'
import { fetchAndValidateIntoAST } from '../../lib/start.ts';

import respondAs from '../utils/respondAs.ts';
import pumpReader from '../utils/pumpReader.ts';
import parseFuncs from '../../lib/parsers/enhancementFunctions.ts';
import funcMap from '../../lib/enhancements/index.ts'
import er from '../../lib/parsers/helpers/error.ts'

export type Dict<T> = {[key:string]: T}
export type ASTChainFunc = (i : PromiseOr<ASTComputable>) => Promise<ASTComputable>

type FuncInterface = {fname:string, params?:Dict<string>}

const applyPipeline = async ( ast: ASTComputable,  ...chainFuncs: ASTChainFunc[])=>{
	return chainFuncs.reduce( async (ast, f)=> f(ast), Promise.resolve(ast)) as Promise<ASTComputable>
}

const setupAstPipeline = async ( ast: ASTComputable,  funcParms: FuncInterface[] ):Promise<ASTComputable> => {
	// import the name
	// apply the params
	// and invoke thunk
	const chainFuncs = await Promise.all(
		funcParms.map(async (f) => {
			if(funcMap?.[f.fname]){
				return funcMap[f.fname](f.params) as ASTChainFunc
			}else{
				return Promise.reject(er(f, 'function name is not understood', new Error().stack ))
			}
		})
	)
	return jsonToComputable(applyPipeline(ast, ...chainFuncs))
}

export const proxy: Handler = async (_, params): Promise<Response> => {
	// find/parse funcs
	const funcs = parseFuncs(params?.composition ?? '') ?? [{fname: 'addHash'}] as FuncInterface[]
	
	// setup AST and apply funcs into new AST
	const ast = await computableToJson(
		setupAstPipeline(
			await fetchAndValidateIntoAST({ url: params?.url ?? '' }), 
			funcs
		)
	)

	// respond AS
	const respAs = await respondAs( params?.outputFmt ?? 'json', { ast, url: params?.url ?? '' });

	// respond sometimes XML, sometimes JSON
	if (respAs.headers.get('Content-Type')?.match('xml')) {
		return respAs;
	} else {
		const s = await pumpReader(respAs.body);
	
		return json({
			_reflect: { params, funcs },
			...(JSON.parse(s) as Record<string, unknown>),
		}, { status: 200 });
	}
};

export default proxy;