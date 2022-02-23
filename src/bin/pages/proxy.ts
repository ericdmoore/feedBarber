import type { Handler  } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import type { PromiseOr, ASTComputable } from '../../types.ts';

import { json } from 'https://deno.land/x/sift@0.4.3/mod.ts';

// import { jsonToComputable } from '../../lib/parsers/ast.ts'
import { fetchAndValidateIntoAST } from '../../lib/start.ts';

import respondAs from '../utils/respondAs.ts';
import pumpReader from '../utils/pumpReader.ts';
import parseFuncs from '../../lib/parsers/enhancementFunctions.ts';
import funcMap from '../../lib/enhancements/index.ts'
import er from '../../lib/parsers/helpers/error.ts'

export type Dict<T> = {[key:string]: T}
export type ASTChainFunc = (i : PromiseOr<ASTComputable>) => Promise<ASTComputable>

type FuncInterface = {fname:string, params?:Dict<string>, messages?: string[]}

const applyPipeline = async ( ast: ASTComputable,  ...chainFuncs: ASTChainFunc[])=>{
	return chainFuncs.reduce( 
		async (ast, f,i) => {
			try{ return f(ast) }
			catch(e){
				console.log(i,e)
				// undo and move on ...
				return ast
			}
		}, Promise.resolve(ast)) as Promise<ASTComputable>
}

const setupAstPipeline = async ( ast: ASTComputable, funcParms: FuncInterface[] ) :Promise<ASTComputable> => {
	// import the name
	// apply the params
	// and invoke thunk
	const chainFuncs = funcParms.map((f,i) => {
			// @todo blow out this directory  
			// integrate with npm?
			// make a developer user name lookup
			// use raw urls?
			if(funcMap?.[f.fname]){
				return funcMap[f.fname](f.params) as ASTChainFunc
			}else{
				funcParms[i].messages = [ ...(funcParms[i].messages ?? []), 'Could not locate this function, so it has been omited from the results']
				return null
			}
		}).filter((f: ASTChainFunc | null) => f as ASTChainFunc) as ASTChainFunc[]
	

	return applyPipeline(ast, ...chainFuncs).catch((e)=>{
		console.log(e);
		return Promise.reject(er(e,`An Error Occured occured on the CityTrain - please look at ${e}`, new Error().stack ))
	})
}

export const proxy: Handler = async (_, params): Promise<Response> => {
	// find/parse funcs
	const funcs = parseFuncs(params?.composition ?? 'addHash') as FuncInterface[]

	const ast = await setupAstPipeline(
		await fetchAndValidateIntoAST({ url: params?.url ?? '' }), 
		funcs
	)

	// console.log({ astViewer: ast })
	// respondAS

	const respAs = await respondAs( params?.outputFmt ?? 'json', { ast, url: params?.url ?? '' });
	
	// respond sometimes XML, sometimes JSON
	if (respAs.headers.get('Content-Type')?.match('xml')) {
		return respAs;
	} else {
		const s = await pumpReader(respAs.body);
		// console.log({ s })

		const body = JSON.parse(s) as Record<string, unknown>
		
		return json({
			_reflect: { params, funcs },
			...body
		}, { status: 200 });
	}
};

export default proxy;