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
// strategy stated - rule based
// simplicity - base principal

@todo - support passing passwords/ secret objects plugins via the URL string
	thus the system will need to support encryption
	So far a rough plan goes like this:
		- each pluginInstallation is given a private/public key pair from the core
		  - key fingerprint is available to the plugin
		- the public key is then made available for encrypting strinbg blobs
		- the encrypter should also include some noise in the payload
		- for example: an extra key value in a JSON.stringify payload or some otherwise meaningless whitespace for some other types of values
		- the plugin will then un-encrypt the value so that only that plugin can read the value
		- the encoding scheme should be marked in the

*/

import { Buffer as nodeBuffer } from 'https://deno.land/std@0.152.0/node/buffer.ts';
import { gzipDecode, gzipEncode } from 'https://deno.land/x/wasm_gzip@v1.0.0/mod.ts';
import { compress as brCompress, decompress as brDecompress } from 'https://deno.land/x/brotli@v0.1.4/mod.ts';
import { compress as zstdCompress, decompress as zstdDecompress } from 'https://deno.land/x/zstd_wasm@0.0.16/deno/zstd.ts';
import * as _jose from 'https://deno.land/x/jose@v4.9.1/index.ts';
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
	auto: {
		stringifyArrays: boolean;
	};
}

export enum TypeNames {
	Just = 'maybe-type__just',
	Nothing = 'maybe-type__nothing',
	Left = 'either-type__left',
	Right = 'either-type__right',
}

export interface Just<T> {
	type: typeof TypeNames.Just;
	val: T;
}
export interface Nothing {
	type: typeof TypeNames.Nothing;
}

export interface Left<L> {
	type: TypeNames.Left;
	left: L;
	right: never;
}
export interface Right<R> {
	type: TypeNames.Right;
	right: R;
	left: never;
}

export type Maybe<J> = Just<J> | Nothing;
export type Either<R, L = Error> = NonNullable<Right<R> | Left<L>>;
export const Nothing = (): Nothing => ({ type: TypeNames.Nothing });
export const Just = <J>(val: J): Just<J> => ({ type: TypeNames.Just, val });

export const Left = <L>(left: L): Left<L> => ({ type: TypeNames.Left, left }) as Left<L>;
export const Right = <R>(right: R): Right<R> => ({ type: TypeNames.Right, right }) as Right<R>;

export type BareParams = number | boolean | null;
export type EncodedParams = string | FunctionBuilderParamInputs | EncodedParams[];

export interface FunctionBuilderParamInputs {
	[paramName: string]: BareParams | EncodedParams;
}

export interface FunctionPathBuilderInputDict {
	[fName: string]: FunctionBuilderParamInputs;
}

export const defaultedOptions = Object.freeze({
	functionDelim: '+',
	paramStart: '(',
	paramEnd: ')',
	argValueDelim: '=',
	argListDelim: '&',
	legendDelim: ',',
	legendSeperator: '::',
	auto: {
		stringifyArrays: true,
	},
	legendOpts: {
		hurdle: 512,
		init: 'ja',
		under: 'ja',
		over: 'jba',
	},
}) as FunctionParsingOptions;

export interface DiscoveryStruct {
	funcs: string[];
	str: string;
}

type Dict<T> = { [str: string]: T };

export type FuncInterface = { fname: string; params?: Dict<string>; errors?: string[] };

const isBareParam = (obj: BareParams | EncodedParams): obj is BareParams => {
	return typeof obj === 'number' ||
		obj instanceof Number ||
		typeof obj === 'boolean' ||
		obj instanceof Boolean ||
		obj === null;
};

const dec = new TextDecoder();
const enc = new TextEncoder();

export const functionsStruct = Object.freeze({
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
export const functionsTransforms = Object.freeze({
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

export const functionsEncodings = Object.freeze({
	// UInt8Array -> string
	toURL: {
		B64: (data: Uint8Array) => nodeBuffer.from(data).toString('base64').replaceAll('/', '_'),
		a: (data: Uint8Array) => nodeBuffer.from(data).toString('base64').replaceAll('/', '_'),
		// B91 -> https://deno.land/x/base91@v1.1 -> 19% overhead in lieu of 33% from b64
		//
		// do Encryption functions as encoding functions since
		// you wont want to compress something already encrypted
		//
		// provides a parameter to another AST middleware - where the param might be their password to an online publication
		// perhaps done where each middle ware gets a public/private key pair - and can serialize via the pub key - JWK?
		//
		// RSA keys as jwk
		// AES-GCM
		// RSA keys via jwe
		// jwk - https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#pkcs_8
		// saltPack | PEX  - https://saltpack.org/encryption-format-v2 | https://book.keybase.io/docs/crypto/key-exchange | https://book.keybase.io/docs/server
	} as { [funcName: string]: (d: Uint8Array) => string },
	// UInt8Array <- string
	fromURL: {
		B64: (URLstring: string) => new Uint8Array(nodeBuffer.from(URLstring.replaceAll('_', '/'), 'base64').buffer),
		a: (URLstring: string) => new Uint8Array(nodeBuffer.from(URLstring.replaceAll('_', '/'), 'base64').buffer),
		// B91 -> https://deno.land/x/base91@v1.1
		// n
	} as { [funcName: string]: (d: string) => Uint8Array },
});

// ASSUMES symetry on to and From URL sides
export const functionAbrevAvailable = [
	...new Set([
		...Object.keys(functionsEncodings.toURL),
		...Object.keys(functionsTransforms.toURL),
		...Object.keys(functionsStruct.toURL),
	]),
];

const sortingWeightsForFunctionTypes = Object.freeze(Object.fromEntries([
	...Object.keys(functionsStruct.toURL).map((f) => [f, -1]),
	...Object.keys(functionsTransforms.toURL).map((f) => [f, 0]),
	...Object.keys(functionsEncodings.toURL).map((f) => [f, 1]),
])) as { [funcNames: string]: number };

export const sortValidFuncs = (funcs: string[], sortFn?: (funcA: unknown, funcB: unknown) => number): string[] => {
	return sortFn
		? funcs.sort(sortFn)
		: funcs.sort((a, z) => sortingWeightsForFunctionTypes[a] - sortingWeightsForFunctionTypes[z]);
};

const tryJSONparse = (s: string): Either<unknown> => {
	try {
		return Right(JSON.parse(s));
	} catch (_er) {
		return Left(new Error(_er));
	}
};

export const legends = (() => {
	/**
	 * Is Legend Input Valid?
	 * @param legend - the pre-split array of characters in the legend, usually the output of parse
	 */
	const isValid = (legend: string[]): boolean => {
		const hasOnlyOneStrucFn = legend.filter((f) => Object.keys(functionsStruct.toURL).includes(f)).length === 1;
		const hasOnlyOneEnc = legend.filter((f) => Object.keys(functionsEncodings.toURL).includes(f)).length === 1;
		return [hasOnlyOneStrucFn, hasOnlyOneEnc].every((condition) => condition);
	};

	const parse = (opts: FunctionParsingOptions = defaultedOptions) =>
		(legend: string): Either<string[]> => {
			const val = legend.includes(opts.legendDelim) ? legend.split(opts.legendDelim) : legend.split('');
			return !val.every((f) => functionAbrevAvailable.includes(f))
				? Left(
					new Error(
						`Found invalid encoding functions: ${val.filter((f) => !!functionAbrevAvailable.includes(f)).join(',')}`,
					),
				)
				: isValid(val)
				? Right(sortValidFuncs(val))
				: Left(
					new Error(`The content encoding legend must have a structure + encoding function, middle funcs are optional`),
				);
		};

	/**
	 * ## Input Types:
	 * - {string}				// bare param form
	 * - {legend}::{string} 	// standard form
	 * - ::{string} 			// implied default form
	 */
	const discover = (opts: FunctionParsingOptions = defaultedOptions) =>
		(maybeLegend?: string): Either<DiscoveryStruct> => {
			// console.log({maybeLegend})
			if (maybeLegend && maybeLegend.includes(opts.legendSeperator)) {
				const parsedLeg = parse(opts)(maybeLegend.split(opts.legendSeperator)[0]);
				if (maybeLegend.split(opts.legendSeperator)[0].length > 0) {
					return parsedLeg.left
						? Left(parsedLeg.left)
						: Right({ funcs: parsedLeg.right, str: maybeLegend.split(opts.legendSeperator)[1] });
				} else {
					const pl = parse(opts)(opts.legendOpts.init);
					return pl.left ? Left(pl.left) : Right({ funcs: pl.right, str: maybeLegend.split(opts.legendSeperator)[1] });
				}
			} else {
				return !maybeLegend
					? Left(new Error('need some input string to imply an legend from'))
					: maybeLegend.length > opts.legendOpts.hurdle
					? Right({ funcs: opts.legendOpts.over.split(''), str: maybeLegend })
					: Right({ funcs: opts.legendOpts.under.split(''), str: maybeLegend });
			}
		};

	const stringify = (legend: string[]) =>
		legend.every((tok) => tok.toLowerCase() === tok) ? legend.join('') : legend.join(',');

	return { parse, stringify, discover, isValid };
})();

export const paramElement = {
	parse: (opts: FunctionParsingOptions = defaultedOptions) =>
		(paramValueString: string): Either<unknown> => {
			// console.log({paramValueString})
			const leg = legends.discover(opts)(paramValueString);
			// console.log('legend::>> ',leg)

			if (leg.left || paramValueString.length === 0) {
				return Left(leg.left ?? new Error('Error - there is no value to return'));
			} else {
				if (['null', 'true', 'false'].includes(leg.right.str)) {
					return Right(JSON.parse(leg.right.str));
				}

				if (!/[^0-9-_.+]+/gi.test(leg.right.str)) { // has no letters
					// NOTE: basė4 has no . char
					const maybeVal = tryJSONparse(leg.right.str);
					return maybeVal.left ? Left(maybeVal.left) : Right(maybeVal.right);
				} else {
					// console.log('string:: ', {str})
					// string, object
					const funcs = leg.right.funcs;
					const [parseFn, unencFn, ...middFns] = funcs.length === 2
						? [functionsStruct.fromURL[funcs[0]], functionsEncodings.fromURL[funcs[1]]]
						: [
							functionsStruct.fromURL[funcs[0]],
							functionsEncodings.fromURL[leg.right.funcs.slice(-1)[0]],
							...funcs.slice(1, -1).map((letter) => functionsTransforms.fromURL[letter]),
						];

					// console.log({ parseFn, unencFn, middFns })

					const composedMiddles = middFns.reduce((p, next) => {
						return (data: Uint8Array) => next(p(data));
					}, (input: Uint8Array) => input);

					return Right(parseFn(composedMiddles(unencFn(leg.right.str))));
				}
			}
		},
	stringify: (legend: string, opts: FunctionParsingOptions = defaultedOptions) =>
		(obj: BareParams | EncodedParams): Either<string> => {
			// const { err, val } = parseLegend(opts, legend)
			const pl = legends.parse(opts)(legend);
			if (pl.left) {
				return Left(pl.left);
			} else {
				const funcs = pl.right;
				if (isBareParam(obj)) {
					// console.log('bare',`${obj}`, {obj})
					return Right(`${obj}`);
				} else {
					// console.log('encoded',{obj})
					const [strFn, encFn, ...middFns] = funcs.length === 2
						? [functionsStruct.toURL[funcs[0]], functionsEncodings.toURL[funcs[1]]]
						: [
							functionsStruct.toURL[funcs[0]],
							functionsEncodings.toURL[funcs.slice(-1)[0]],
							...funcs.slice(1, -1).map((letter) => functionsTransforms.toURL[letter]),
						];

					const composedMiddles = middFns.reduce((p, next) => {
						return (data: Uint8Array) => next(p(data));
					}, (input: Uint8Array) => input);

					return Right(`${legends.stringify(funcs)}${opts.legendSeperator}${encFn(composedMiddles(strFn(obj)))}`);
				}
			}
		},
};

export const params = {
	parse: (opts: FunctionParsingOptions = defaultedOptions) =>
		(multiParamStr: string): Either<FunctionBuilderParamInputs> => {
			const mapped = multiParamStr
				.split(opts.argListDelim)
				.map((paramChunks) => {
					// console.log({paramChunks})
					const [name, val] = paramChunks.split(opts.argValueDelim);
					if (!val) {
						return Left(new Error('Parameter string does not contain a key value pair'));
					} else {
						const pp = paramElement.parse()(val);
						return pp.left ? Left(pp.left) : Right({ [name]: pp.right });
					}
				}) as Either<FunctionBuilderParamInputs, Error>[];

			const errs = mapped.filter((item) => item.left);
			return errs.length > 0
				? Left(new Error(errs.map((er) => er.left).join('\n\n')))
				: Right(mapped.reduce((acc, c) => ({ ...acc, ...c.right }), {} as FunctionBuilderParamInputs));
		},
	stringify: (opts: FunctionParsingOptions = defaultedOptions) =>
		(param: FunctionBuilderParamInputs): Either<string> => {
			// FUTURE DEV: since the only source of errors is via "invalid legend keys"
			// and since they are hard coded for now, there is zero chance of propogating errors
			// this would change if the legend is free-handed by the user - clearly that could have errors
			return Right(
				Object.entries(param)
					.map(([paramName, paramVal]) => {
						if (isBareParam(paramVal)) {
							const encDataStr = paramElement.stringify('sa')(paramVal);
							return encDataStr.left
								? Left(encDataStr.left) // can't happen since 'sa' is hard coded
								: Right(`${paramName}${opts.argValueDelim}${encDataStr.right}`);
						} else {
							return typeof paramVal === 'string'
								? paramVal.length > opts.legendOpts.hurdle
									? Right(`${paramName}${opts.argValueDelim}${paramElement.stringify('sba')(paramVal).right}`) // sba vs sa
									: Right(`${paramName}${opts.argValueDelim}${paramElement.stringify('sa')(paramVal).right}`) // sba vs ja
								: JSON.stringify(paramVal).length > opts.legendOpts.hurdle // heuristic
								? Right(`${paramName}${opts.argValueDelim}${paramElement.stringify('jba')(paramVal).right}`) // jbs in lieu of sa
								: Right(`${paramName}${opts.argValueDelim}${paramElement.stringify('ja')(paramVal).right}`); // ja in lieu of sa
						}
					})
					.filter((ei) => ei.right)
					.map((ei) => ei.right)
					.join(opts.argListDelim),
			);
		},
};

export const functions = {
	encoders: functionsEncodings,
	transforms: functionsTransforms,
	structs: functionsStruct,
	parse: (opts: FunctionParsingOptions = defaultedOptions) =>
		(compositionStr: string): Either<FuncInterface[]> => {
			const parsedFunctions = compositionStr
				.split(opts.functionDelim)
				.map((funcStr) => {
					const [f, pStr] = funcStr.split(opts.paramStart);
					return { fname: f, multiParamStr: !pStr ? '' : pStr.slice(0, -1) }; // pull off last )
				})
				.map(({ fname, multiParamStr }) => {
					const parsedParams = params.parse(opts)(multiParamStr);
					return { fname, params: parsedParams.right, errors: parsedParams.left };
				});

			const pfErrs = parsedFunctions.filter((pf) => pf.errors);
			return pfErrs.length > 0
				? Left(new Error(pfErrs.reduce((acc, pf) => `${acc}\n${pf.errors}`, '')))
				: Right(parsedFunctions.map((pf) => ({
					fname: pf.fname,
					params: pf.params,
				} as FuncInterface)));
		},
	stringify: (opts: FunctionParsingOptions = defaultedOptions) =>
		(...funcList: FunctionPathBuilderInputDict[]): Either<string> => {
			const mapped = funcList
				.filter((fObj) => Object.keys(fObj).length === 1)
				.map((fObj) => {
					const [fName, paramObj] = Object.entries(fObj)[0]; //shgould only be 1 due to filter
					const paramBodyStr = params.stringify(opts)(paramObj);
					return paramBodyStr.left
						? Left(paramBodyStr.left)
						: Right(`${fName}${opts.paramStart}${paramBodyStr.right}${opts.paramEnd}`);
				}) as Either<string>[];

			const errList = mapped.filter((item) => item.left);
			return errList.length > 0
				? Left(new Error(errList.map((er) => er.left).join('\n\n')))
				: Right(mapped.map((item) => item.right).join(opts.functionDelim));
		},
};

export default { params, functions, legends };

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
