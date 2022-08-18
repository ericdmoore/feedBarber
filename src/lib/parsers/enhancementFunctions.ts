import { gzipDecode, gzipEncode } from 'https://deno.land/x/wasm_gzip@v1.0.0/mod.ts';
import { compress, decompress } from 'https://deno.land/x/brotli@v0.1.4/mod.ts';
import { Buffer as nodeBuffer } from 'https://deno.land/std@0.152.0/node/buffer.ts';
import * as bson from "https://deno.land/x/deno_bson@v0.0.2/mod.ts";

export type StringInStringOut = (s: string) => string;
export interface FunctionParsingOptions {
	functionDelim: string;
	argValueDelim: string;
	argListDelim: string;
	paramStart: string;
	legendDelim: string
}

export interface FunctionBuilderParamInputs {
	[paramName: string]: string | EncodedString | FunctionBuilderParamInputs;
}

export interface EncodedString {
	_: { val: string; enc?: string };
}

export interface FunctionPathBuilderInputs {
	f: string;
	params?: FunctionBuilderParamInputs;
}

const parseOptions = Object.freeze({
	functionDelim: '+',
	paramStart: '(',
	argValueDelim: '=',
	argListDelim: '&',
	legendDelim: ','
}) as FunctionParsingOptions;

/*
Rusty Double colon
Content Encoding Prefixes (Comma Separated) :: Value
Example:

B64::{{btoa value here}} - a::
JSON,B64::{{btoa value here}} - ja::
JSON,GZ,B64::{{btoa value here}} - jga::
JSON,BR,B64::{{btoa value here}} - jba::
STR,BR,B64::{{btoa value here}} - sba::
STR,B64::{{btoa value here}} - sa::
BSON,B64::{{btoa value here}} - ba::

*/
const dec = new TextDecoder()
const enc = new TextEncoder()

export const contentStructure = Object.freeze({
	// data -> UInt8Array
	toURL:{
		STR: (text:string) => enc.encode(text),
		s: (text:string) => enc.encode(text),
		JSON: (obj:unknown) =>  new Uint8Array(nodeBuffer.from(JSON.stringify(obj),'utf8').buffer),
		j: 	  (obj:unknown) => new Uint8Array(nodeBuffer.from(JSON.stringify(obj),'utf8').buffer),
		BSON: (obj:unknown) => new Uint8Array(bson.serialize(obj as bson.Document)),
		b: 	  (obj:unknown) => new Uint8Array(bson.serialize(obj as bson.Document)),
	} as {[funcName:string]: (d:unknown) => Uint8Array} , 
	// data <- UInt8Array
	fromURL:{
		STR:  (data:Uint8Array) => dec.decode(data),
		s:    (data:Uint8Array) => dec.decode(data),
		JSON: (data:Uint8Array) => JSON.parse(dec.decode(data)),
		j: 	  (data:Uint8Array) => JSON.parse(dec.decode(data)),
		BSON: (obj:Uint8Array) =>  bson.deserialize(obj),
		b: 	  (obj:Uint8Array) =>  bson.deserialize(obj),
	} as {[funcName:string]: (d:Uint8Array) => unknown} , 
}) 

// UInt8Array <-> UInt8Array
export const middleFuncs = Object.freeze({
	toURL:{
		GZ: gzipEncode,
		g: gzipEncode,
		BR: compress,
		b: compress
	} as {[transformName:string]:(i:Uint8Array) => Uint8Array },
	fromURL:{
		GZ: gzipDecode,
		g: gzipDecode,
		BR: decompress,
		b: decompress
	} as {[transformName:string]:(i:Uint8Array) => Uint8Array }
})

export const encodingFunctions = Object.freeze({
	// UInt8Array -> string
	toURL:{
		id: (data: Uint8Array) => dec.decode(data),
		B64: (data: Uint8Array) => nodeBuffer.from(data).toString('base64'),
		a: (data: Uint8Array) => nodeBuffer.from(data).toString('base64'),
	} as {[funcName:string]: (d:Uint8Array) => string} ,
	// UInt8Array <- string
	fromURL:{
		id: (URLstring: string) => enc.encode(URLstring), // default
		B64: (URLstring: string) => new Uint8Array(nodeBuffer.from(URLstring,'base64').buffer),
		a: (URLstring: string) => new Uint8Array(nodeBuffer.from(URLstring,'base64').buffer)
	} as {[funcName:string]: (d:string) => Uint8Array}
});

// ASSUMES symetry on to and From URL sides
export const FuncsAVAIL = [...new Set([
	...Object.keys(encodingFunctions.toURL),
	...Object.keys(middleFuncs.toURL),
	...Object.keys(contentStructure.toURL),
])]

export const validFuncWeights = Object.freeze(Object.fromEntries([
	...Object.keys(contentStructure.toURL).map((f)=>([f,-1])),
	...Object.keys(middleFuncs.toURL).map((f)=>([f,0])),
	...Object.keys(encodingFunctions.toURL).map((f)=>([f,1]))
])) as {[funcNames:string]: number}

export const sortValidFuncs = (funcs:string[]):string[] =>{
	return funcs.sort((a,z)=>{
		return validFuncWeights[a] - validFuncWeights[z]
	})
}

export const legendIsValid = (legend:string[]):boolean =>{
	const hasStructureFn = legend.some(f => Object.keys(contentStructure.toURL).includes(f))
	const hasEndFunc = legend.some(f => Object.keys(encodingFunctions.toURL).includes(f))
	return hasStructureFn && hasEndFunc
}

export const parseLegend = (opts: FunctionParsingOptions, legend:string): { funcs:string[] } | {err:Error}=>{
	const funcs = legend.includes(opts.legendDelim) 
		? legend.split(opts.legendDelim) 
		: legend.split('')
	return !funcs.every(f=>FuncsAVAIL.includes(f))
		? { err:  new Error(`Found invalid encoding functions: ${funcs.filter(f=> !!FuncsAVAIL.includes(f)).join(',') }`)}  
		: legendIsValid(funcs)
			? { funcs: sortValidFuncs(funcs) }
			: { err: new Error(`The content encoding legend must have a structure + encoding function, middle funcs are optional`)}
}

export const encodeParams = (opts: FunctionParsingOptions, legend:string)=>(obj:unknown): string | {err: Error} =>{
	const pLegend = parseLegend(opts, legend)
	if('err' in pLegend){
		return {err: pLegend.err}
	}else{
		const [strFn, encFn, ...middFns] = pLegend.funcs.length === 2 
			? [
				contentStructure.toURL[pLegend.funcs[0]], 
				encodingFunctions.toURL[pLegend.funcs[1]] 
			]
			: [
				contentStructure.toURL[pLegend.funcs[0]], 
				encodingFunctions.toURL[pLegend.funcs.slice(-1)[0]],
				...pLegend.funcs.slice(1,-1).map((letter) => middleFuncs.toURL[letter]) 
			];
		return ''
	}
}



export const parseFunctions = (compositinPath: string, opts: FunctionParsingOptions = parseOptions) : FunctionPathBuilderInputs => {
	// const unencoded = decodeURIComponent(compositinPath);
	// const removedEndSlash = unencoded.endsWith('/') ? unencoded.slice(0, -1) : unencoded;

	// const funcitonTokens = removedEndSlash
	// 	.split(opts.functionDelim)
	// 	.map((fc) => {
	// 		const [f, pStr] = fc.split(opts.paramStart);
	// 		return { fname: f, paramStr: !pStr ? null : pStr.slice(0, -1) }; // pull off last )
	// 	});

	// const namedFuncWithNamedParams = funcitonTokens.map((i) =>
	// 	typeof i.paramStr === 'string'
	// 		? {
	// 			fName: i.fname,
	// 			namedParamVals: Object.fromEntries(
	// 				i.paramStr.split(opts.argListDelim).map((s) => s.split(opts.argValueDelim)),
	// 			) as { [paramName: string]: string },
	// 		}
	// 		: {
	// 			fName: i.fname,
	// 			namedParamVals: {} as { [paramName: string]: string },
	// 		}
	// );

	// const removedExtraQuotes = namedFuncWithNamedParams.map((t) => {
	// 	const tupleArgNameArgVal: [string, string | undefined][] = Object.entries(
	// 		t.namedParamVals,
	// 	)
	// 		// starts with / ??? Wha?
	// 		.map(([argName, argVal]: [string, string | undefined]) => {
	// 			// console.log(argVal).
	// 			if (argVal?.startsWith('\'')) argVal = argVal?.slice(1);
	// 			if (argVal?.endsWith('\'')) argVal = argVal?.slice(0, -1);
	// 			return [argName.trim(), argVal?.trim()];
	// 		});

	// 	return {
	// 		f: t.fName.trim(),
	// 		params: tupleArgNameArgVal.reduce((p, [k, v]) => {
	// 			if (k.length === 0) return p;
	// 			if (typeof v === 'undefined' || v === null) return p;
	// 			return { ...p, [k]: v };
	// 		}, {} as { [name: string]: string }),
	// 	};
	// });

	// const objectToUndef = removedExtraQuotes.map((func) =>
	// 	Object.keys(func.params).length === 0 ? { f: func.f, params: undefined } : func
	// ) as { f: string; params?: { [param: string]: string } }[];

	// return objectToUndef;
	return {f:''}
};

const buildNonStringParam = (opts: FunctionParsingOptions = parseOptions) =>
	(param: FunctionBuilderParamInputs): string => {
		// return Object.entries(param)
		// 	.reduce((acc, [paramName, paramVal]) => {
		// 		return typeof paramVal === 'string'
		// 			? `${acc}${opts.argListDelim}${paramName}${opts.argValueDelim}${paramVal}`
		// 			: 'enc' in paramVal && paramVal.enc && encodingFunctions[paramVal.enc]
		// 			? `${acc}${opts.argListDelim}${paramName}${opts.argValueDelim}${encodingFunctions[paramVal.enc](paramVal.val)}`
		// 			: typeof paramVal.val === 'string'
		// 			? `${acc}${opts.argListDelim}${paramName}${opts.argValueDelim}${paramVal}`
		// 			: buildNonStringParam(opts)(paramVal.val);
		// 	}, '');

		// 
		return ''
	};

export const buildFunctionString = (opts: FunctionParsingOptions = parseOptions) =>
	(...funcs: FunctionPathBuilderInputs[]) => {
		// return funcs.reduce((acc, { f, params }) => {
		// 	return !params ? acc + `${f}` : acc + `${f}(${
		// 		Object.entries(params)
		// 			.map(([argName, argVal]) =>
		// 				typeof argVal === 'string'
		// 					? `${argName}${opts.argValueDelim}${argVal}`
		// 					: 'enc' in argVal
		// 					? `${argName}${opts.argValueDelim}${argVal.val}`
		// 					: `${argName}${opts.argValueDelim}${argVal.val}`
		// 			).join(opts.argListDelim)
		// 	})`;
		// }, '');

		//
		return ''
	};

export default parseFunctions;

// trying to keep this list as URL safe as possible
// const opts = parseOptions;

// const happyTest = `preview()${opts.functionDelim}` +
// 	`addBody(css${opts.argValueDelim}'a'${opts.argListDelim}root${opts.argValueDelim}'#main')${opts.functionDelim}` +
// 	`rmAds(list${opts.argValueDelim}'')${opts.functionDelim}` +
// 	`funcOne(p1${opts.argValueDelim}""${opts.argListDelim}p2${opts.argValueDelim}"'a'")${opts.functionDelim}` +
// 	`addsubs`;

// const percent20Test = `preview(show${opts.argValueDelim}false)${opts.functionDelim}` +
// 	`%20addBody(css%20${opts.argValueDelim}'a'${opts.argListDelim}%20root='#main')${opts.functionDelim}` +
// 	`rmAds(list${opts.argValueDelim}'')${opts.functionDelim}` +
// 	`%20addsubs%20`;

// const happyTestPath = buildFunctionString(opts)(
// 	{ f: 'addBody', params: { 'css': 'a' } },
// 	{ f: 'rmAds', params: { 'list': 'http://easylist.co' } },
// 	{ f: 'funcOne', params: { 'p1': '', 'p2': '' } },
// 	{ f: 'addsubs', params: { some: { nested: { object: 'string' } } } },
// );

// console.log('composition: ', happyTest, '\n', parseFunctions(happyTest, opts));
