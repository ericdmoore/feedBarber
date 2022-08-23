/*
Rusty Double colon
Content Encoding Prefixes (Comma Separated) :: Value
Example:

STR,B64::{{btoa value here}} - sa::
STR,BR,B64::{{btoa value here}} - sba::
STR,GZ,B64::{{btoa value here}} - sga::

JSON,B64::{{btoa value here}} - ja::
JSON,GZ,B64::{{btoa value here}} - jga::
JSON,BR,B64::{{btoa value here}} - jba::

BSON,B64::{{btoa value here}} - ba::

@todo
// how to inject 'sa'??? why not sba? what if b
// seems like you have a hierarchy of S's
//
// stated output - do this
// strategy stated - principal based
// simplicity - base principal

*/

import { gzipDecode, gzipEncode } from 'https://deno.land/x/wasm_gzip@v1.0.0/mod.ts';
import { compress as brCompress, decompress as brDecompress } from 'https://deno.land/x/brotli@v0.1.4/mod.ts';
import { Buffer as nodeBuffer } from 'https://deno.land/std@0.152.0/node/buffer.ts';
import {
	compress as zstdCompress,
	decompress as zstdDecompress,
} from 'https://deno.land/x/zstd_wasm@0.0.16/deno/zstd.ts';
import * as bson from 'https://deno.land/x/deno_bson@v0.0.2/mod.ts';

export interface FunctionParsingOptions {
	functionDelim: string;
	argValueDelim: string;
	argListDelim: string;
	paramStart: string;
	paramEnd: string;
	legendDelim: string;
	legendSeperator: string;
	legendOpts: {
		hurdle: number;
		init: string;
		under: string;
		over: string;
	};
}

type valReturnNullOr<T> = { val: T; err: null } | { err: Error; val: null };

type BareParams = number | boolean | null;
type EncodedParams = string | FunctionBuilderParamInputs;
type ParseParamReturn = valReturnNullOr<FunctionBuilderParamInputs>;

export interface FunctionBuilderParamInputs {
	[paramName: string]: BareParams | EncodedParams;
}

export interface FunctionPathBuilderInputDict {
	[fName: string]: FunctionBuilderParamInputs;
}

export const parseOptions = Object.freeze({
	functionDelim: '+',
	paramStart: '(',
	paramEnd: ')',
	argValueDelim: '=',
	argListDelim: '&',
	legendDelim: ',',
	legendSeperator: '::',
	legendOpts: {
		init: 'ja',
		hurdle: 512,
		under: 'ja',
		over: 'jba',
	},
}) as FunctionParsingOptions;

type DiscoveryInterface = Discovery_Error | Discovery_Data;
interface Discovery_Error {
	err: Error;
	funcs: null;
	str: null;
}
interface Discovery_Data {
	err: null;
	funcs: string[];
	str: string;
}

type LegendInterface = Legend_Error | Legend_Data;
interface Legend_Error {
	err: Error;
	funcs: null;
}
interface Legend_Data {
	err: null;
	funcs: string[];
}

const isBareParam = (obj: BareParams | EncodedParams): obj is BareParams => {
	return typeof obj === 'number' ||
		obj instanceof Number ||
		typeof obj === 'boolean' ||
		obj instanceof Boolean ||
		obj === null;
};

const dec = new TextDecoder();
const enc = new TextEncoder();

export const contentStructureFns = Object.freeze({
	// data -> UInt8Array
	toURL: {
		STR: (text: string) => enc.encode(text),
		s: (text: string) => enc.encode(text),
		JSON: (obj: unknown) => new Uint8Array(nodeBuffer.from(JSON.stringify(obj), 'utf8').buffer),
		j: (obj: unknown) => new Uint8Array(nodeBuffer.from(JSON.stringify(obj), 'utf8').buffer),
		BSON: (obj: unknown) => new Uint8Array(bson.serialize(obj as bson.Document)),
		m: (obj: unknown) => new Uint8Array(bson.serialize(obj as bson.Document)),
	} as { [funcName: string]: (d: unknown) => Uint8Array },
	// data <- UInt8Array
	fromURL: {
		STR: (data: Uint8Array) => dec.decode(data),
		s: (data: Uint8Array) => dec.decode(data),
		JSON: (data: Uint8Array) => JSON.parse(dec.decode(data)),
		j: (data: Uint8Array) => JSON.parse(dec.decode(data)),
		BSON: (obj: Uint8Array) => bson.deserialize(obj),
		m: (obj: Uint8Array) => bson.deserialize(obj),
	} as { [funcName: string]: (d: Uint8Array) => unknown },
});

// UInt8Array <-> UInt8Array
export const transformFns = Object.freeze({
	toURL: {
		GZ: gzipEncode,
		g: gzipEncode,
		BR: brCompress,
		b: brCompress,
		ZSTD: zstdCompress,
		z: zstdCompress,
	} as { [transformName: string]: (i: Uint8Array) => Uint8Array },
	fromURL: {
		GZ: gzipDecode,
		g: gzipDecode,
		BR: brDecompress,
		b: brDecompress,
		ZSTD: (i: Uint8Array) => new Uint8Array(zstdDecompress(i)),
		z: (i: Uint8Array) => new Uint8Array(zstdDecompress(i)),
	} as { [transformName: string]: (i: Uint8Array) => Uint8Array },
});

export const encodingFns = Object.freeze({
	// UInt8Array -> string
	toURL: {
		B64: (data: Uint8Array) => nodeBuffer.from(data).toString('base64'),
		a: (data: Uint8Array) => nodeBuffer.from(data).toString('base64'),
		// B91 -> https://deno.land/x/base91@v1.1
		// n
		// do Encryption functions as encoding functions since
		// you wont want to compress something already encrypted
		//
		// provides a parameter to another AST middleware - where the param might be their password to an online publication
		// perhaps done where each middle ware gets a public/private key pair - and can serialize via the pub key - JWK?
		//
		// jwk - https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#pkcs_8
		// saltPack | PEX  - https://saltpack.org/encryption-format-v2 | https://book.keybase.io/docs/crypto/key-exchange | https://book.keybase.io/docs/server
	} as { [funcName: string]: (d: Uint8Array) => string },
	// UInt8Array <- string
	fromURL: {
		B64: (URLstring: string) => new Uint8Array(nodeBuffer.from(URLstring, 'base64').buffer),
		a: (URLstring: string) => new Uint8Array(nodeBuffer.from(URLstring, 'base64').buffer),
		// B91 -> https://deno.land/x/base91@v1.1
		// n
	} as { [funcName: string]: (d: string) => Uint8Array },
});

// ASSUMES symetry on to and From URL sides
export const FuncsAVAIL = [
	...new Set([
		...Object.keys(encodingFns.toURL),
		...Object.keys(transformFns.toURL),
		...Object.keys(contentStructureFns.toURL),
	]),
];

export const validFuncWeights = Object.freeze(Object.fromEntries([
	...Object.keys(contentStructureFns.toURL).map((f) => [f, -1]),
	...Object.keys(transformFns.toURL).map((f) => [f, 0]),
	...Object.keys(encodingFns.toURL).map((f) => [f, 1]),
])) as { [funcNames: string]: number };

export const sortValidFuncs = (funcs: string[]): string[] => {
	return funcs.sort((a, z) => {
		return validFuncWeights[a] - validFuncWeights[z];
	});
};

const tryJSONparse = (s: string): valReturnNullOr<unknown> => {
	try {
		return { err: null, val: JSON.parse(s) as unknown };
	} catch (_er) {
		return { err: new Error(_er), val: null };
	}
};

export const legendIsValid = (legend: string[]): boolean => {
	const hasOnlyOneStrucFn = legend.filter((f) => Object.keys(contentStructureFns.toURL).includes(f)).length === 1;
	const hasOnlyOneEnc = legend.filter((f) => Object.keys(encodingFns.toURL).includes(f)).length === 1;
	return [hasOnlyOneStrucFn, hasOnlyOneEnc].every((condition) => condition);
};

// All shorthand
// otherwise bumped to mixed/longform
export const stringifyLegend = (legend: string[]) =>
	legend.every((tok) => tok.toLowerCase() === tok) ? legend.join('') : legend.join(',');

export const parseLegend = (opts: FunctionParsingOptions, legend: string): valReturnNullOr<string[]> => {
	const val = legend.includes(opts.legendDelim) ? legend.split(opts.legendDelim) : legend.split('');
	return !val.every((f) => FuncsAVAIL.includes(f))
		? {val: null, err: new Error(`Found invalid encoding functions: ${val.filter((f) => !!FuncsAVAIL.includes(f)).join(',')}`) } 
		: legendIsValid(val)
		? { err: null, val: sortValidFuncs(val) }
		: { val: null, err: new Error(`The content encoding legend must have a structure + encoding function, middle funcs are optional`)}
};

/**
 * ## Input Types:
 * - {string}				// bare param form
 * - {legend}::{string} 	// standard form
 * - ::{string} 			// implied default form
 */
export const discoverLegend = (opts: FunctionParsingOptions = parseOptions)=>(maybeLegend: string): DiscoveryInterface => {
	if(maybeLegend.includes(opts.legendSeperator)){
		const parsedLeg = parseLegend(opts, maybeLegend.split(opts.legendSeperator)[0])
		if(maybeLegend.split(opts.legendSeperator)[0].length > 0){
			return parsedLeg.err
			? { funcs: null, str: null, err: parsedLeg.err }
			: { err: null, funcs: parsedLeg.val, str: maybeLegend.split(opts.legendSeperator)[1]}
		}else{
			const {err, val} = parseLegend(opts, opts.legendOpts.init)
			return err
			? { err, funcs: null, str: null }
			: { err: null, funcs: val, str: maybeLegend.split(opts.legendSeperator)[1] }
		}
	}else{
		return maybeLegend.length > opts.legendOpts.hurdle
		? { err: null, funcs: opts.legendOpts.over.split(''), str: maybeLegend } as Discovery_Data
		: { err: null, funcs: opts.legendOpts.under.split(''), str: maybeLegend } as Discovery_Data;
	}
}

	

export const parseParam = (opts: FunctionParsingOptions = parseOptions) => ( paramValueString: string): valReturnNullOr<unknown> => {
	const { err, funcs, str } = discoverLegend(opts)(paramValueString);

	if (err) {
		return { err, val: null };
	} else {
		if (['null', 'true', 'false'].includes(str)) {
			return { val: JSON.parse(str), err: null };
		}

		if (!/[^0-9-_.+]+/gi.test(str)) { // has no letters
			// NOTE: basė4 has no . char
			const maybeVal = tryJSONparse(str);
			return maybeVal.err ? { err: tryJSONparse(str).err, val: null } : { val: maybeVal.val, err: null };
		} else {
			// console.log('string:: ', {str})
			// string, object
			const [parseFn, unencFn, ...middFns] = funcs.length === 2
				? [contentStructureFns.fromURL[funcs[0]], encodingFns.fromURL[funcs[1]]]
				: [
					contentStructureFns.fromURL[funcs[0]],
					encodingFns.fromURL[funcs.slice(-1)[0]],
					...funcs.slice(1, -1).map((letter) => transformFns.fromURL[letter]),
				];

			// console.log({ parseFn, unencFn, middFns })

			const composedMiddles = middFns.reduce((p, next) => {
				return (data: Uint8Array) => next(p(data));
			}, (input: Uint8Array) => input);

			return { err: null, val: parseFn(composedMiddles(unencFn(str))) };
		}
	}
};

export const encodeParam = (legend: string, opts: FunctionParsingOptions = parseOptions ) =>
	(obj: BareParams | EncodedParams): valReturnNullOr<string> => {
		const { err, val } = parseLegend(opts, legend)
		if (err) {
			return { err, val: null };
		} else {
			const funcs = val
			if (isBareParam(obj)) {
				// console.log('bare',{obj})
				return { val: `${obj}`, err: null };
			} else {
				// console.log('encoded',{obj})
				const [strFn, encFn, ...middFns] = funcs.length === 2
					? [contentStructureFns.toURL[funcs[0]], encodingFns.toURL[funcs[1]]]
					: [
						contentStructureFns.toURL[funcs[0]],
						encodingFns.toURL[funcs.slice(-1)[0]],
						...funcs.slice(1, -1).map((letter) => transformFns.toURL[letter]),
					];

				const composedMiddles = middFns.reduce((p, next) => {
					return (data: Uint8Array) => next(p(data));
				}, (input: Uint8Array) => input);

				return { err: null, val: `${stringifyLegend(funcs)}${opts.legendSeperator}${encFn(composedMiddles(strFn(obj)))}` };
			}
		}
	};

// NOTE: depending on the dynamic composition of the legend values,
// this funciton may also have to return errors as values
export const buildParams = (opts: FunctionParsingOptions = parseOptions) =>
	(param: FunctionBuilderParamInputs): valReturnNullOr<string> => {
		// FUTURE DEV: since the only source of errors is via "invalid legend keys"
		// and since they are hard coded for now, there is zero chance of propogating errors
		// this would change if the legend is free-handed by the user - clearly that could have errors
		return { 
			err: null , 
			val: Object.entries(param)
				.map(([paramName, paramVal]) => {
					if (isBareParam(paramVal)) {
						return `${paramName}${opts.argValueDelim}${encodeParam('sa')(paramVal).val}`; // sa doesn't matter here
					} else {
						return typeof paramVal === 'string'
							? `${paramName}${opts.argValueDelim}${encodeParam('sa')(paramVal).val}` // sa vs ja
							: `${paramName}${opts.argValueDelim}${encodeParam('ja')(paramVal).val}`;
					}
				}).join(opts.argListDelim)
		}
	};

export const parseParams = (opts: FunctionParsingOptions = parseOptions) => (multiParamStr: string): ParseParamReturn => {
		const mapped = multiParamStr
			.split(opts.argListDelim)
			.map((paramChunks) => {
				const [name, val] = paramChunks.split(opts.argValueDelim);
				const r = parseParam()(val);
				return (r.err
					? { p: null, err: r.err }
					: { err: null, p: { [name]: r.val } } as { err: null; p: { [s: string]: unknown } } | { err: Error; p: null });
			});

		const errs = mapped.filter((item) => item.err);
		if (errs.length > 0) {
			return {
				val: null,
				err: new Error(errs.join('\n\n')),
			};
		} else {
			return {
				err: null,
				val: mapped.reduce((acc, c) => ({
					...acc,
					...c.p,
				}), {} as { [s: string]: unknown }) as FunctionBuilderParamInputs,
			};
		}
	};

/*
{
	f:'name':
	params: {
		//
		key1: 'sa::string',
		keyA: {
			keyI: 'string',
			keyII: true
			keyIII: {deepNesting: "sa::Other"}
			}
		}
}

// OR WHAT IF WE DID?? -- But the issue is ordering in a dict is loosley governed
{
	FName1: {} // object is params
	FName2: {} // object is params
}

// OR WHAT IF WE DID?? -- But the issue is ordering in a dict is loosley governed
// So maybe it coudld be supported but you would neecd to echo back the names in order for verification

// object is params; 1 key per object, next function  object goes in next on the array
[
	{ FName1: {p1: true, p2: false} }
	{ FName2: {} }
]

*/
export const buildFunctionString = (opts: FunctionParsingOptions = parseOptions) =>
	(...funcList: FunctionPathBuilderInputDict[]): valReturnNullOr<string> => {
		const mapped = funcList
			.filter((fObj) => Object.keys(fObj).length === 1)
			.map((fObj) => {
				const [fName, paramObj] = Object.entries(fObj)[0]; //shgould only be 1 due to filter
				const paramBodyStr = buildParams(opts)(paramObj);
				return paramBodyStr.err
					? { val: null, err: paramBodyStr.err }
					: { err: null, val: `${fName}${opts.paramStart}${paramBodyStr.val}${opts.paramEnd}` };
			});

		const errList = mapped.filter((item) => item.err);
		return errList.length
			? { val: null, err: new Error(errList.join('\n\n')) }
			: { err: null, val: mapped.map((item) => item.val).join(opts.functionDelim) };
	};

export const parseFunctions = (_opts: FunctionParsingOptions = parseOptions) =>
	(_compositionStr: string): valReturnNullOr<FunctionPathBuilderInputDict> => {
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
		return { err: null, val: {} };
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
