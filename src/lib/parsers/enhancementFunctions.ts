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

export enum TypeNames {
	Just = 'maybe-type__just',
	Nothing = 'maybe-type__nothing',
	Left = 'either-type__left',
	Right = 'either-type__right',
}
  
export interface Just<T> {
	type: typeof TypeNames.Just
	val: T
}
export interface Nothing {
	type: typeof TypeNames.Nothing
}

export interface Left<L> {
	type: TypeNames.Left,
	left: L
	right: never
}
export interface Right<R> {
	type: TypeNames.Right,
	right: R
	left: never
}

export type Maybe<J> = Just<J> | Nothing
export type Either<R, L = Error> = NonNullable< Right<R> | Left<L>>
export const Nothing = (): Nothing => ({ type: TypeNames.Nothing })
export const Just = <J> (val: J): Just<J> => ({ type: TypeNames.Just, val })

export const Left = <L>(left: L): Left<L> => ({ type: TypeNames.Left, left }) as Left<L>
export const Right = <R> (right: R): Right<R> => ({ type: TypeNames.Right, right }) as Right<R>

export type BareParams = number | boolean | null;
export type EncodedParams = string | FunctionBuilderParamInputs;

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

interface DiscoveryStruct {
	funcs: string[];
	str: string;
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

const tryJSONparse = (s: string): Either<unknown> => {
	try {
		return Right(JSON.parse(s))
	} catch (_er) {
		return Left(new Error(_er));
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
	legend.every((tok) => tok.toLowerCase() === tok) 
		? legend.join('') 
		: legend.join(',');

export const parseLegend = (opts: FunctionParsingOptions, legend: string): Either<string[]> => {
	const val = legend.includes(opts.legendDelim) ? legend.split(opts.legendDelim) : legend.split('');
	return !val.every((f) => FuncsAVAIL.includes(f))
		? Left(new Error(`Found invalid encoding functions: ${val.filter((f) => !!FuncsAVAIL.includes(f)).join(',')}`))
		: legendIsValid(val)
			? Right(sortValidFuncs(val))
			: Left(new Error(`The content encoding legend must have a structure + encoding function, middle funcs are optional`))
};

/**
 * ## Input Types:
 * - {string}				// bare param form
 * - {legend}::{string} 	// standard form
 * - ::{string} 			// implied default form
 */
export const discoverLegend = (opts: FunctionParsingOptions = parseOptions)=>(maybeLegend: string): Either<DiscoveryStruct> => {
	if(maybeLegend.includes(opts.legendSeperator)){
		const parsedLeg = parseLegend(opts, maybeLegend.split(opts.legendSeperator)[0])
		if(maybeLegend.split(opts.legendSeperator)[0].length > 0){
			return parsedLeg.left
			? Left(parsedLeg.left)
			: Right({funcs: parsedLeg.right, str: maybeLegend.split(opts.legendSeperator)[1]})
		}else{
			const pl = parseLegend(opts, opts.legendOpts.init)
			return pl.left
				? Left(pl.left)
				: Right({funcs: pl.right, str: maybeLegend.split(opts.legendSeperator)[1] })
		}
	}else{
		return maybeLegend.length > opts.legendOpts.hurdle
			? Right({ funcs: opts.legendOpts.over.split(''), str: maybeLegend })
			: Right({ funcs: opts.legendOpts.under.split(''), str: maybeLegend })
	}
}

export const parseParam = (opts: FunctionParsingOptions = parseOptions) => ( paramValueString: string): Either<unknown> => {
	const leg = discoverLegend(opts)(paramValueString);
	// console.log('legend::>> ',leg)
	
	if (leg.left) {
		return Left(leg.left);
	} else {
		if (['null', 'true', 'false'].includes(leg.right.str)) {
			return Right(JSON.parse(leg.right.str))
		}

		if (!/[^0-9-_.+]+/gi.test(leg.right.str)) { // has no letters
			// NOTE: basė4 has no . char
			const maybeVal = tryJSONparse(leg.right.str);
			return maybeVal.left 
				? Left(maybeVal.left) 
				: Right(maybeVal.right)
		} else {
			// console.log('string:: ', {str})
			// string, object
			const funcs = leg.right.funcs
			const [parseFn, unencFn, ...middFns] = funcs.length === 2
				? [contentStructureFns.fromURL[funcs[0]], encodingFns.fromURL[funcs[1]]]
				: [
					contentStructureFns.fromURL[funcs[0]],
					encodingFns.fromURL[leg.right.funcs.slice(-1)[0]],
					...funcs.slice(1, -1).map((letter) => transformFns.fromURL[letter]),
				];

			// console.log({ parseFn, unencFn, middFns })

			const composedMiddles = middFns.reduce((p, next) => {
				return (data: Uint8Array) => next(p(data));
			}, (input: Uint8Array) => input);

			return Right(parseFn(composedMiddles(unencFn(leg.right.str))))
		}
	}
};

export const encodeParam = (legend: string, opts: FunctionParsingOptions = parseOptions ) =>
	(obj: BareParams | EncodedParams): Either<string> => {
		// const { err, val } = parseLegend(opts, legend)
		const pl = parseLegend(opts, legend)

		if (pl.left) {
			return Left(pl.left);
		} else {
			const funcs = pl.right
			if (isBareParam(obj)) {
				// console.log('bare',`${obj}`, {obj})
				return Right(`${obj}`)
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

				return Right(`${stringifyLegend(funcs)}${opts.legendSeperator}${encFn(composedMiddles(strFn(obj)))}` )
			}
		}
	};

// NOTE: depending on the dynamic composition of the legend values,
// this funciton may also have to return errors as values
export const buildParams = (opts: FunctionParsingOptions = parseOptions) =>
	(param: FunctionBuilderParamInputs): Either<string> => {
		// FUTURE DEV: since the only source of errors is via "invalid legend keys"
		// and since they are hard coded for now, there is zero chance of propogating errors
		// this would change if the legend is free-handed by the user - clearly that could have errors
		return Right( 
			Object.entries(param)
			.map(([paramName, paramVal]) => {
				if (isBareParam(paramVal)) {
					const encDataStr = encodeParam('sa')(paramVal)
					return encDataStr.left 
						? Left(encDataStr.left) // can't happen since 'sa' is hard coded
						: Right(`${paramName}${opts.argValueDelim}${encDataStr.right}`)
				} else {
					return typeof paramVal === 'string'
						? Right(`${paramName}${opts.argValueDelim}${encodeParam('sa')(paramVal).right}`) // sa vs ja
						: Right(`${paramName}${opts.argValueDelim}${encodeParam('ja')(paramVal).right}`);
				}
			})
			.filter(ei => ei.right)
			.map(ei => ei.right)
			.join(opts.argListDelim)
		)
	};
/**
 * ### Parse Params
 * 
 * The inverse of `buildParams`
 * 
 * 
 * @param opts 
 * @returns 
 */
export const parseParams = (opts: FunctionParsingOptions = parseOptions) => (multiParamStr: string): Either<FunctionBuilderParamInputs> => {
		const mapped = multiParamStr
			.split(opts.argListDelim)
			.map((paramChunks) => {
				const [name, val] = paramChunks.split(opts.argValueDelim);
				const pp = parseParam()(val);
				return pp.left
					? Left(pp.left)
					: Right({ [name]: pp.right })
			}) as Either<FunctionBuilderParamInputs, Error>[];

		const errs = mapped.filter((item) => item.left);
		if (errs.length > 0) {
			return Left(new Error(errs.map(er => er.left).join('\n\n')))
		} else {
			return Right( 
				mapped.reduce((acc, c) => ({
					...acc,
					...c.right,
				}), {} as FunctionBuilderParamInputs)
			)
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
	(...funcList: FunctionPathBuilderInputDict[]): Either<string> => {
		const mapped = funcList
			.filter((fObj) => Object.keys(fObj).length === 1)
			.map((fObj) => {
				const [fName, paramObj] = Object.entries(fObj)[0]; //shgould only be 1 due to filter
				const paramBodyStr = buildParams(opts)(paramObj);
				return paramBodyStr.left
					? Left(paramBodyStr.left)
					: Right(`${fName}${opts.paramStart}${paramBodyStr.right}${opts.paramEnd}`)
			}) as Either<string>[];

		const errList = mapped.filter((item) => item.left);
		return errList.length > 0
			? Left( new Error(errList.map(er=>er.left).join('\n\n')))
			: Right( mapped.map((item) => item.right).join(opts.functionDelim))
	};

export const parseFunctions = (opts: FunctionParsingOptions = parseOptions) =>
	(compositionStr: string): Either<FunctionPathBuilderInputDict> => {
		
		const funcitonTokens = compositionStr
			.split(opts.functionDelim)
			.map((funcStr) => {
				const [f, pStr] = funcStr.split(opts.paramStart);
				return { fname: f, paramStr: !pStr ? null : pStr.slice(0, -1) }; // pull off last )
			});

		console.log(funcitonTokens)

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
		return Left(new Error('unfinished function'));
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
