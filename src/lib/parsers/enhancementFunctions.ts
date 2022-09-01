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
		  - keys and key fingerprints are available to the plugin
		- the public key is then made available for encrypting string blobs
		- the encrypter should also include some noise in the payload
		- for example: an extra key value in a JSON.stringify payload or some otherwise meaningless whitespace for some other types of values
		- the plugin will then un-encrypt the value so that only that plugin can read the value
		- the encoding scheme should be marked in the

*/

import { Buffer as nodeBuffer } from 'https://deno.land/std@0.152.0/node/buffer.ts';
import { gzipDecode, gzipEncode } from 'https://deno.land/x/wasm_gzip@v1.0.0/mod.ts';
import { compress as brCompress, decompress as brDecompress } from 'https://deno.land/x/brotli@v0.1.4/mod.ts';
import { compress as zstdCompress, decompress as zstdDecompress } from 'https://deno.land/x/zstd_wasm@0.0.16/deno/zstd.ts';
import * as jose from 'https://deno.land/x/jose@v4.9.1/index.ts';
import * as bson from 'https://deno.land/x/deno_bson@v0.0.2/mod.ts';

export enum CryptoKeyUsages {
    'encrypt' = 'encrypt',
    'decrypt' = 'decrypt',
    'sign' = 'sign',
    'verify' = 'verify',
    'deriveKey' = 'deriveKey',
    'deriveBits' = 'deriveBits',
    'wrapKey' = 'wrapKey',
    'unwrapKey' = 'unwrapKey',
}

export enum JWS_ALG {
	'HS256' = 'HS256',
	'HS384' = 'HS384',
	'HS512' = 'HS512',
	'RS256' = 'RS256',
	'RS384' = 'RS384',
	'RS512' = 'RS512',
	'ES256' = 'ES256',
	'ES384' = 'ES384',
	'ES512' = 'ES512',
	'PS256' = 'PS256',
	'PS384' = 'PS384',
	'PS512' = 'PS512',
}

export enum JWE_ALG {
	'RSA1_5' = 'RSA1_5',
	'RSA-OAEP' = 'RSA-OAEP',
	'RSA-OAEP-256' = 'RSA-OAEP-256',
	'ECDH-ES ' = 'ECDH-ES ',
	'A128KW' = 'A128KW',
	'A192KW' = 'A192KW',
	'A256KW' = 'A256KW',
}

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
	encryptionKeys?: {
		privateKey: string | jose.JWK;
		publicKey: string | jose.JWK;
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


export const functionsStruct = (() => {
	const strEnc = async (text: string) => enc.encode(text);
	const jsonEnc = async (obj: unknown) => new Uint8Array(nodeBuffer.from(JSON.stringify(obj), 'utf8').buffer);
	const bsonEnc = async (obj: unknown) => new Uint8Array(bson.serialize(obj as bson.Document));

	const strDec = async (data: Uint8Array) => dec.decode(data);
	const jsonDec = async (data: Uint8Array) => JSON.parse(dec.decode(data));
	const bsonDec = async (obj: Uint8Array) => bson.deserialize(obj);

	return Object.freeze({
		// data -> UInt8Array
		toURL: {
			STR: strEnc,
			s: strEnc,
			JSON: jsonEnc,
			j: jsonEnc,
			BSON: bsonEnc,
			m: bsonEnc,
		} as { [funcName: string]: (d: unknown) => Promise<Uint8Array> },
		// data <- UInt8Array
		fromURL: {
			STR: strDec,
			s: strDec,
			JSON: jsonDec,
			j: jsonDec,
			BSON: bsonDec,
			m: bsonDec,
		} as { [funcName: string]: (d: Uint8Array) => Promise<unknown> },
	});
})();


export const functionsTransforms = (() => {
	const gzEnc = async (bytes: Uint8Array) => gzipEncode(bytes);
	const brEnc = async (bytes: Uint8Array) => brCompress(bytes);
	const zEnc = async (bytes: Uint8Array) => zstdCompress(bytes);

	const gzDec = async (bytes: Uint8Array) => gzipDecode(bytes);
	const brDec = async (bytes: Uint8Array) => brDecompress(bytes);
	const zDec = async (i: Uint8Array) => new Uint8Array(zstdDecompress(i));

	return Object.freeze({
		toURL: {
			GZ: gzEnc,
			g: gzEnc,
			BR: brEnc,
			b: brEnc,
			ZSTD: zEnc,
			z: zEnc,
		} as { [transformName: string]: (i: Uint8Array) => Promise<Uint8Array> },
		fromURL: {
			GZ: gzDec,
			g: gzDec,
			BR: brDec,
			b: brDec,
			ZSTD: zDec,
			z: zDec,
		} as { [transformName: string]: (i: Uint8Array) => Promise<Uint8Array> },
	});
})();

export const jwkRSAtoCryptoKey = async (key: JsonWebKey, usages: KeyUsage[] = [CryptoKeyUsages.encrypt])=>{
	return crypto.subtle.importKey('jwk', key, {name:JWE_ALG['RSA-OAEP'], hash:'SHA-512'}, true, usages)
}

export const functionsEncodings = ((publicKey: JsonWebKey, privateKey: JsonWebKey) => {
	const B64toURL = async (data: Uint8Array) => nodeBuffer.from(data).toString('base64').replaceAll('/', '_');
	const B64fromURL = async (URLstring: string) =>
		new Uint8Array(nodeBuffer.from(URLstring.replaceAll('_', '/'), 'base64').buffer);
	
	// @todo JWE stuff here
	const JWEtoURL = async (data: Uint8Array) => {
		return new jose.CompactEncrypt(data)
			// .setProtectedHeader({ alg: JWE_ALG['RSA-OAEP'], enc: 'A256GCM' })
			.encrypt(await jwkRSAtoCryptoKey(publicKey));
	} 
		
	const JWEFromURL = async (URLstring: string) => {
		return (await jose.compactDecrypt(URLstring, await jwkRSAtoCryptoKey(privateKey, [CryptoKeyUsages.decrypt]))).plaintext;
	}

	return Object.freeze({
		toURL: {
			B64: B64toURL,
			a: B64toURL,
			JWE: JWEtoURL,
			e: JWEtoURL,
		} as { [funcName: string]: (d: Uint8Array) => Promise<string> },
		fromURL: {
			B64: B64fromURL,
			a: B64fromURL,
			JWE: JWEFromURL,
			e: JWEFromURL,
		} as { [funcName: string]: (d: string) => Promise<Uint8Array> },
	});
})( {} ,{} );



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
		async (paramValueString: string): Promise<Either<unknown>> => {
			// console.log({paramValueString})
			const leg = legends.discover(opts)(paramValueString);

			if (leg.left || paramValueString.length === 0) {
				return Left(leg.left ?? new Error('Error - there is no value to return'));
			}
			if (leg.right.funcs.filter((value) => ['JWE', 'e'].includes(value)).length > 0 && !opts.encryptionKeys) {
				return Left(new Error('to use the JWE/e encoding functions, both the public and private keys are needed'));
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
						return async (data: Uint8Array) => next(await p(data));
					}, async (input: Uint8Array) => input);

					return Right(await parseFn(await composedMiddles(await unencFn(leg.right.str))));
				}
			}
		},
	stringify: (legend: string, opts: FunctionParsingOptions = defaultedOptions) =>
		async (obj: BareParams | EncodedParams): Promise<Either<string>> => {
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
						return async (data: Uint8Array) => next(await p(data));
					}, async (input: Uint8Array) => input);

					return Right(
						`${legends.stringify(funcs)}${opts.legendSeperator}${await encFn(await composedMiddles(await strFn(obj)))}`,
					);
				}
			}
		},
};

export const params = {
	parse: (opts: FunctionParsingOptions = defaultedOptions) =>
		async (multiParamStr: string): Promise<Either<FunctionBuilderParamInputs>> => {
			const mapped = await Promise.all(
				multiParamStr
					.split(opts.argListDelim)
					.map(async (paramChunks) => {
						// console.log({paramChunks})
						const [name, val] = paramChunks.split(opts.argValueDelim);
						if (!val) {
							return Left(new Error('Parameter string does not contain a key value pair'));
						} else {
							const pp = await paramElement.parse()(val);
							return pp.left ? Left(pp.left) : Right({ [name]: pp.right });
						}
					}),
			) as Either<FunctionBuilderParamInputs>[];

			const errs = mapped.filter((item) => item.left);
			return errs.length > 0
				? Left(new Error(errs.map((er) => er.left).join('\n\n')))
				: Right(mapped.reduce((acc, c) => ({ ...acc, ...c.right }), {} as FunctionBuilderParamInputs));
		},
	stringify: (opts: FunctionParsingOptions = defaultedOptions) =>
		async (param: FunctionBuilderParamInputs): Promise<Either<string>> => {
			// FUTURE DEV: since the only source of errors is via "invalid legend keys"
			// and since they are hard coded for now, there is zero chance of propogating errors
			// this would change if the legend is free-handed by the user - clearly that could have errors

			const resolvedEithers = await Promise.all(
				Object.entries(param)
					.map(async ([paramName, paramVal]) => {
						if (isBareParam(paramVal)) {
							const encDataStr = await paramElement.stringify('sa')(paramVal);
							return encDataStr.left
								? Left(encDataStr.left) // can't happen since 'sa' is hard coded
								: Right(`${paramName}${opts.argValueDelim}${encDataStr.right}`);
						} else {
							return typeof paramVal === 'string'
								? paramVal.length > opts.legendOpts.hurdle
									? Right(`${paramName}${opts.argValueDelim}${(await paramElement.stringify('sba')(paramVal)).right}`) // sba vs sa
									: Right(`${paramName}${opts.argValueDelim}${(await paramElement.stringify('sa')(paramVal)).right}`) // sba vs ja
								: JSON.stringify(paramVal).length > opts.legendOpts.hurdle // heuristic
								? Right(`${paramName}${opts.argValueDelim}${(await paramElement.stringify('jba')(paramVal)).right}`) // jbs in lieu of sa
								: Right(`${paramName}${opts.argValueDelim}${(await paramElement.stringify('ja')(paramVal)).right}`); // ja in lieu of sa
						}
					}),
			) as Either<string>[];

			const errs = resolvedEithers.filter((ei) => ei.left);
			return errs.length > 0 ? Left(new Error(errs.map((ei) => ei.left).join('\n\n'))) : Right(
				resolvedEithers
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
		async (compositionStr: string): Promise<Either<FuncInterface[]>> => {
			const parsedFunctions = await Promise.all(
				compositionStr
					.split(opts.functionDelim)
					.map((funcStr) => {
						const [f, pStr] = funcStr.split(opts.paramStart);
						return { fname: f, multiParamStr: !pStr ? '' : pStr.slice(0, -1) }; // pull off last )
					})
					.map(async ({ fname, multiParamStr }) => {
						const parsedParams = await params.parse(opts)(multiParamStr);
						return { fname, params: parsedParams.right, errors: parsedParams.left };
					}),
			);

			const pfErrs = parsedFunctions.filter((pf) => pf.errors);
			return pfErrs.length > 0
				? Left(new Error(pfErrs.reduce((acc, pf) => `${acc}\n${pf.errors}`, '')))
				: Right(parsedFunctions.map((pf) => ({
					fname: pf.fname,
					params: pf.params,
				} as FuncInterface)));
		},
	stringify: (opts: FunctionParsingOptions = defaultedOptions) =>
		async (...funcList: FunctionPathBuilderInputDict[]): Promise<Either<string>> => {
			const mapped = await Promise.all(
				funcList
					.filter((fObj) => Object.keys(fObj).length === 1)
					.map(async (fObj) => {
						const [fName, paramObj] = Object.entries(fObj)[0]; //shgould only be 1 due to filter
						const paramBodyStr = await params.stringify(opts)(paramObj);
						return paramBodyStr.left
							? Left(paramBodyStr.left)
							: Right(`${fName}${opts.paramStart}${paramBodyStr.right}${opts.paramEnd}`);
					}),
			) as Either<string>[];

			const errList = mapped.filter((item) => item.left);
			return errList.length > 0
				? Left(new Error(errList.map((er) => er.left).join('\n\n')))
				: Right(mapped.map((item) => item.right).join(opts.functionDelim));
		},
};

export default { params, functions, legends };
