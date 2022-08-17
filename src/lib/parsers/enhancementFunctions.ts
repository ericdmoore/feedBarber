import { gzipEncode, gzipDecode } from "https://deno.land/x/wasm_gzip@v1.0.0/mod.ts";
import { compress, decompress } from "https://deno.land/x/brotli@v0.1.4/mod.ts";
import { Buffer } from "https://deno.land/std@0.152.0/node/buffer.ts"

export type StringInStringOut = (s:string)=>string
export interface FunctionParsingOptions{
	functionDelim: string,
	argValueDelim: string,
	argListDelim: string
	paramStart: string
}

export interface FunctionBuilderParamInputs{
	[paramName:string]: string | EncodedString | FunctionBuilderParamInputs
}

export interface EncodedString {
	_:{val: string; enc?: string}
}

export interface FunctionPathBuilderInputs{
	f: string
	params?: FunctionBuilderParamInputs
}

const parseOptions = Object.freeze({ 
	functionDelim: '+',
	paramStart: '(',
	argValueDelim: '=',
	argListDelim: '&'
})

/* 
Rusty Double colon 
Content Encoding Prefixes (Comma Separated) :: Value
Example:



B64::{{btoa value here}} - a::
JSON,B64::{{btoa value here}} - ja::
JSON,GZ,B64::{{btoa value here}} - jga::
JSON,BR,B64::{{btoa value here}} - jba::

*/
''

const textToGzipToBase64 = (text:string) =>  Buffer.from(gzipEncode(Buffer.from(text,'utf8' ))).toString('base64')
const base64ToUngzipToText = (b64:string) => Buffer.from(gzipDecode(Buffer.from(b64,'base64'))).toString('utf8')

export const encodingFunctions = Object.freeze({
	id: (s:string)=>s, // default 
	base64: btoa,
	gzip: textToGzipToBase64
}) as {[funcName:string]: StringInStringOut}

export const decodingFunctions = Object.freeze({
	id: (s:string)=>s, // default 
	base64: atob as StringInStringOut,
	gzip: base64ToUngzipToText
}) as {[funcName:string]: StringInStringOut}


export const parseFunctions = (compositinPath: string, opts: FunctionParsingOptions = parseOptions ) => {
	const unencoded = decodeURIComponent(compositinPath);
	const removedEndSlash = unencoded.endsWith('/') ? unencoded.slice(0, -1) : unencoded;

	const funcitonTokens = removedEndSlash
		.split(opts.functionDelim)
		.map((fc) => {
			const [f, pStr] = fc.split(opts.paramStart);
			return { fname: f, paramStr: !pStr ? null : pStr.slice(0, -1) }; // pull off last )
		});

	const namedFuncWithNamedParams = funcitonTokens.map((i) =>
		typeof i.paramStr === 'string'
			? {
				fName: i.fname,
				namedParamVals: Object.fromEntries(
					i.paramStr.split(opts.argListDelim).map((s) => s.split(opts.argValueDelim)),
				) as { [paramName: string]: string },
			}
			: {
				fName: i.fname,
				namedParamVals: {} as { [paramName: string]: string },
			}
	);

	const removedExtraQuotes = namedFuncWithNamedParams.map((t) => {
		const tupleArgNameArgVal: [string, string | undefined][] = Object.entries(
			t.namedParamVals,
		)
			// starts with / ??? Wha?
			.map(([argName, argVal]: [string, string | undefined]) => {
				// console.log(argVal).
				if (argVal?.startsWith('\'')) argVal = argVal?.slice(1);
				if (argVal?.endsWith('\'')) argVal = argVal?.slice(0, -1);
				return [argName.trim(), argVal?.trim()];
			});

		return {
			f: t.fName.trim(),
			params: tupleArgNameArgVal.reduce((p, [k, v]) => {
				if (k.length === 0) return p;
				if (typeof v === 'undefined' || v === null) return p;
				return { ...p, [k]: v };
			}, {} as { [name: string]: string }),
		};
	});

	const objectToUndef = removedExtraQuotes.map((func) =>
		Object.keys(func.params).length === 0 ? { f: func.f, params: undefined } : func
	) as { f: string; params?: { [param: string]: string } }[];
	
	return objectToUndef;
};

const buildNonStringParam = (opts:FunctionParsingOptions = parseOptions)=>(param: FunctionBuilderParamInputs ):string=>{
	return Object.entries(param).
		reduce((acc, [paramName, paramVal])=>{
		return typeof paramVal === 'string'
		? `${acc}${opts.argListDelim}${paramName}${opts.argValueDelim}${paramVal}`
		: 'enc' in paramVal && paramVal.enc && encodingFunctions[paramVal.enc]
			? `${acc}${opts.argListDelim}${paramName}${opts.argValueDelim}${encodingFunctions[paramVal.enc](paramVal.val)}`
			: typeof paramVal.val ==='string'
				? `${acc}${opts.argListDelim}${paramName}${opts.argValueDelim}${paramVal}`
				: buildNonStringParam(opts)(paramVal.val)
		},'')
}

export const buildFunctionString = (opts:FunctionParsingOptions = parseOptions ) => 
	(...funcs:FunctionPathBuilderInputs[]) => {
		return funcs.reduce((acc,{ f, params })=>{
			return !params 
				? acc + `${f}` 
				: acc + `${f}(${Object.entries(params)
					.map(([argName, argVal]) => typeof argVal=== 'string' 
						? `${argName}${opts.argValueDelim}${argVal}`
						:  'enc' in argVal
								? `${argName}${opts.argValueDelim}${argVal.val}`
								: `${argName}${opts.argValueDelim}${argVal.val}`

					).join(opts.argListDelim)
				})`
		},'')
}

export default parseFunctions;


// trying to keep this list as URL safe as possible
const opts = parseOptions

const happyTest = `preview()${opts.functionDelim}` 
				+ `addBody(css${opts.argValueDelim}'a'${opts.argListDelim}root${opts.argValueDelim}'#main')${opts.functionDelim}`
				+ `rmAds(list${opts.argValueDelim}'')${opts.functionDelim}`
				+ `funcOne(p1${opts.argValueDelim}""${opts.argListDelim}p2${opts.argValueDelim}"'a'")${opts.functionDelim}`
				+ `addsubs`;

const percent20Test = `preview(show${opts.argValueDelim}false)${opts.functionDelim}`
					+ `%20addBody(css%20${opts.argValueDelim}'a'${opts.argListDelim}%20root='#main')${opts.functionDelim}`
					+ `rmAds(list${opts.argValueDelim}'')${opts.functionDelim}`
					+ `%20addsubs%20`;

const happyTestPath = buildFunctionString(opts)(
	{f:'addBody', params:{'css':'a'}},
	{f:'rmAds',   params:{'list':'http://easylist.co'}},
	{f:'funcOne', params:{'p1':'','p2':""}},
	{f:'addsubs', params:{some:{nested:{object:'string'}}}}
)

console.log('composition: ', happyTest, '\n', parseFunctions(happyTest, opts));
