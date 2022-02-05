import { fromXml } from '../mod.ts';
import { IValidate } from '../types.ts';
import { atom, jsonfeed, rss, sitemap } from './parsers/index.ts';

export type ISupportedTypeNames =
	| 'atom'
	| 'jsonFeed'
	| 'jsonLD'
	| 'sitemap'
	| 'rss'
	| 'JS_SELECTION_ERROR'
	| 'TEXT_SELECTION_ERROR';

export type ISupportedTypes =
	| atom.RespStruct
	| jsonfeed.RespStruct
	| rss.RespStruct
	| sitemap.RespStruct;

export type TypedValidator = <T>(copmact: T | unknown) => IValidate<T>;

export type IDictUnionOfPayloadTypes =
	| { kind: 'atom'; data: typeof atom.AtomResponse.TYPE; parser: TypedValidator }
	| { kind: 'jsonFeed'; data: typeof jsonfeed.JsonFeedKind.TYPE; parser: TypedValidator }
	// | { kind: 'jsonLD'; data: typeof jsonfeed.JsonFeedKind.TYPE }
	| { kind: 'rss'; data: typeof rss.RssResponse.TYPE; parser: TypedValidator }
	| { kind: 'sitemap'; data: typeof sitemap.SitemapKind.TYPE; parser: TypedValidator }
	| { kind: 'JS_SELECTION_ERROR'; data: Error; parser: TypedValidator }
	| { kind: 'TEXT_SELECTION_ERROR'; data: Error; parser: TypedValidator };

export type IDictValidPayloadTypes = Exclude<
	IDictUnionOfPayloadTypes,
	| { kind: 'JS_SELECTION_ERROR' } 
	| { kind: 'TEXT_SELECTION_ERROR' }
>;

export const parseAndPickType = (
	responseText: string,
): IDictUnionOfPayloadTypes => {
	try {
		const jsO = JSON.parse(responseText);
		if ('items' in jsO) {
			return {
				kind: 'jsonFeed',
				data: jsO as typeof jsonfeed.JsonFeedKind.TYPE,
				parser: jsonfeed.JsonFeed,
			};
		} else {
			return {
				kind: 'JS_SELECTION_ERROR',
				data: new Error(),
				parser: jsonfeed.JsonFeed,
			};
		}
	} catch (_) {
		const jsO = fromXml.xml2js(responseText, { compact: true });
		// console.log({ jsO });
		if (jsO?.feed) {
			return {
				kind: 'atom',
				data: jsO as typeof atom.AtomResponse.TYPE,
				parser: atom.Atom,
			};
		} else if (jsO?.rss) {
			return {
				kind: 'rss',
				data: jsO as typeof rss.RssResponse.TYPE,
				parser: rss.Rss,
			};
		} else if (jsO?.urlset || jsO?.sitemapindex) {
			return {
				kind: 'sitemap',
				data: jsO as typeof sitemap.SitemapKind.TYPE,
				parser: sitemap.Sitemap,
			};
		} else {
			return {
				kind: 'TEXT_SELECTION_ERROR',
				data: new Error(),
				parser: jsonfeed.JsonFeed,
			};
		}
	}
};

export const typedValidation = async (
	input: IDictUnionOfPayloadTypes,
): Promise<IDictValidPayloadTypes> => {
	switch (input.kind) {
		case 'rss':
			return {
				kind: 'rss',
				data: await rss.Rss(input.data).validate(),
				parser: rss.Rss,
			} as IDictValidPayloadTypes;
		case 'atom':
			return {
				kind: 'atom',
				data: await atom.Atom(input.data).validate(),
				parser: atom.Atom,
			} as IDictValidPayloadTypes;
		case 'jsonFeed':
			return {
				kind: 'jsonFeed',
				data: await jsonfeed.JsonFeed(input.data).validate(),
				parser: jsonfeed.JsonFeed,
			} as IDictValidPayloadTypes;
		case 'sitemap':
			return {
				kind: 'sitemap',
				data: await sitemap.Sitemap(input.data).validate(),
				parser: sitemap.Sitemap,
			} as IDictValidPayloadTypes;
		default:
			return {} as never;
	}
};

export const start = async (url: string) => {
	const remoteData = await fetch(url);
	return remoteData.text();
};

export const parseAndValidate = async (txt:string) => 
	typedValidation(parseAndPickType(txt));
	
export const fetchParseValidate = async (url: string) => 
	typedValidation(parseAndPickType(await start(url)));

export const fetchAndValidateIntoAST = async (url: string) =>{
	const r = await fetchParseValidate(url)
	return r.parser(r.data).toAST()
}

export default parseAndPickType;
