import { fromXml } from '../mod.ts';
import { ASTComputable, IValidate } from '../types.ts';
import { atom, jsonfeed, rss, sitemap } from './parsers/index.ts';
import { computableToJson } from './parsers/ast.ts';

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

export type TypedValidator = <T>(copmact: T | unknown, url: string) => IValidate<T>;

export type IDictUnionOfPayloadTypes =
	| {
		kind: 'jsonFeed';
		url: string;
		data: typeof jsonfeed.JsonFeedKind.TYPE;
		parser: TypedValidator;
	}
	| { kind: 'atom'; url: string; data: typeof atom.AtomResponse.TYPE; parser: TypedValidator }
	// | { kind: 'jsonLD'; data: typeof jsonfeed.JsonFeedKind.TYPE }
	| { kind: 'rss'; url: string; data: typeof rss.RssResponse.TYPE; parser: TypedValidator }
	| { kind: 'sitemap'; url: string; data: typeof sitemap.SitemapKind.TYPE; parser: TypedValidator }
	| { kind: 'JS_SELECTION_ERROR'; url: string; data: Error; parser: TypedValidator }
	| { kind: 'TEXT_SELECTION_ERROR'; url: string; data: Error; parser: TypedValidator };

export type IDictValidPayloadTypes = Exclude<
	IDictUnionOfPayloadTypes,
	| { kind: 'JS_SELECTION_ERROR' }
	| { kind: 'TEXT_SELECTION_ERROR' }
>;

export const parseAndPickType = (i: {
	url: string;
	txt: string;
}): IDictUnionOfPayloadTypes => {
	try {
		const jsO = JSON.parse(i.txt);
		if ('items' in jsO) {
			return {
				url: i.url,
				kind: 'jsonFeed',
				data: jsO as typeof jsonfeed.JsonFeedKind.TYPE,
				parser: jsonfeed.JsonFeed,
			};
		} else {
			return {
				url: i.url,
				kind: 'JS_SELECTION_ERROR',
				data: new Error(),
				parser: jsonfeed.JsonFeed,
			};
		}
	} catch (_) {
		const jsO = fromXml.xml2js(i.txt, { compact: true });
		// console.log({ jsO });
		if (jsO?.feed) {
			return {
				url: i.url,
				kind: 'atom',
				data: jsO as typeof atom.AtomResponse.TYPE,
				parser: atom.Atom,
			};
		} else if (jsO?.rss) {
			return {
				url: i.url,
				kind: 'rss',
				data: jsO as typeof rss.RssResponse.TYPE,
				parser: rss.Rss,
			};
		} else if (jsO?.urlset || jsO?.sitemapindex) {
			return {
				url: i.url,
				kind: 'sitemap',
				data: jsO as typeof sitemap.SitemapKind.TYPE,
				parser: sitemap.Sitemap,
			};
		} else {
			return {
				url: i.url,
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
				url: input.url,
				data: await rss.Rss(input.data, input.url).validate(),
				parser: rss.Rss,
			} as IDictValidPayloadTypes;
		case 'atom':
			return {
				kind: 'atom',
				url: input.url,
				data: await atom.Atom(input.data, input.url).validate(),
				parser: atom.Atom,
			} as IDictValidPayloadTypes;
		case 'jsonFeed':
			return {
				kind: 'jsonFeed',
				url: input.url,
				data: await jsonfeed.JsonFeed(input.data, input.url).validate(),
				parser: jsonfeed.JsonFeed,
			} as IDictValidPayloadTypes;
		case 'sitemap':
			return {
				kind: 'sitemap',
				url: input.url,
				data: await sitemap.Sitemap(input.data, input.url).validate(),
				parser: sitemap.Sitemap,
			} as IDictValidPayloadTypes;
		default:
			return {} as never;
	}
};

export const start = async (url: string) => {
	const remoteData = await fetch(url);
	return { url, txt: await remoteData.text() };
};

export const parseAndValidate = async (url: string, txt: string) =>
	typedValidation(parseAndPickType({ txt, url }));

export const fetchParseValidate = async (url: string) =>
	typedValidation(parseAndPickType(await start(url)));

export const fetchAndValidateIntoAST = async (url: string) => {
	const r = await fetchParseValidate(url);
	const astC = await r.parser(r.data, r.url).toAST() as ASTComputable;
	return computableToJson(astC);
};

export default parseAndPickType;
