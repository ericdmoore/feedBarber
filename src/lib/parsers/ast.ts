import type { IDictValidPayloadTypes, ISupportedTypes } from '../start.ts';

import { superstruct as s } from '../../mod.ts';
import { ASTShell, IValidate } from '../../types.ts';

import * as rss from './rss.ts';
import * as jsonFeed from './jsonFeed.ts';
import * as sitemap from './sitemap.ts';
import * as atom from './atom.ts';

const {
	type,
	object,
	union,
	string,
	optional,
	array,
	enums,
	partial,
	number,
	nonempty,
	define,
	record,
	unknown,
	// literal,
} = s;

export const validatedInputToAst = async (
	preValidatecdInput: IDictValidPayloadTypes,
	url: string
): Promise<AST> => {
	switch (preValidatecdInput.kind) {
		case 'atom':
			return await atom.Atom(preValidatecdInput.data, url).toAST();
		case 'rss':
			return await rss.Rss(preValidatecdInput.data, url).toAST();
		case 'jsonFeed':
			return await jsonFeed.JsonFeed(preValidatecdInput.data, url).toAST();
		case 'sitemap':
			return await sitemap.Sitemap(preValidatecdInput.data, url).toAST();
		default:
			return {} as never;
	}
};

export const astShell = async (
	parser: IValidate<ISupportedTypes>,
	url: string,
	ast?: ASTcomputable,
	pos: { pageBy: number; cur: number } = { pageBy: 50, cur: 0 },
): Promise<ASTShell> => {
	return {
		ast: ast ?? await parser.toAST(),
		parserData: parser._,
		pos: {
			pageBy: 50,
			total: 234,
			cur: 2,
			remaining: 234 - 2,
		},
		items: {
			stream: ():ReadableStream<typeof ASTFeedItemJson.TYPE[]> => {
				return new ReadableStream<typeof ASTFeedItemJson.TYPE[]>()
			},
			iter: async function * ():AsyncGenerator<typeof ASTFeedItemJson.TYPE[]>{
				let nextP = await parser.next()
				let ast = await parser.clone(nextP.val , parser.url).toAST()
				while (nextP.canNext){
					yield ast.item.list as typeof ASTFeedItemJson.TYPE[]
					nextP = await parser.next()
					ast = await parser.clone(nextP.val , parser.url).toAST()
				}
				return ast.item.list
			},
			all: async () => {
				return [] as typeof ASTFeedItemJson.TYPE[]
			}
		},
		changeState:{
			next: async () => {
				const { val } = await parser.next();
				ast = await parser.clone(val, url).toAST();
				return astShell(parser, url, ast, pos);
			},
			prev: async () => {
				const { val } = await parser.prev();
				ast = await parser.clone(val, url).toAST();
				return astShell(parser, url, ast, pos);
			},
		},
		use: async (fns) => {
			return fns.reduce(
				async (p, f) => f(await p),
				astShell(
					parser,
					url,
					ast ?? await parser.toAST(),
					pos,
				),
			);
		},
		toXML: () => {
			// ast ? parser.fromAST(ast).toXml() : parser.
			return '';
		},
	};
};

const Thunk = <T>() =>
	define(
		'thunk',
		(value: unknown) => typeof value === 'function' || value instanceof Function,
	) as s.Struct<() => Promise<T>, null>;
const StrThunk = Thunk<string>();
const eitherThunkOr = <T, S>(type: s.Struct<T, S>) => union([type, StrThunk]);

const EventNames = enums(['read', 'share', 'send', 'rated', 'reviewed', 'replied']);
const EventLifecycle = enums(['alpha', 'beta', 'active', 'sunset', 'deprecated']);

export const EventStreamKind = object({
	event: EventNames,
	refUrl: string(),
	jsonSchemaUrl: string(),
	status: object({
		name: EventLifecycle,
		start: optional(union([Thunk<number>(), number()])),
		end: optional(union([Thunk<number>(), number()])),
	}),
});

export const eventDefinition = (
	name: typeof EventNames.TYPE,
	urls: { ref?: string; schema?: string },
	status: { name: typeof EventLifecycle.TYPE; start?: number; end?: number },
): typeof EventStreamKind.TYPE => ({
	event: name,
	//@todo add default docs
	jsonSchemaUrl: urls.schema ?? '',
	refUrl: urls.ref ?? '',
	status: {
		name: 'active',
		start: status.start ?? new Date(2020, 0, 1).getTime(),
		end: status.end ?? new Date(2030, 11, 31).getTime(),
	},
});

export const ASTAuthor = type({
	name: string(),
	url: optional(string()),
	email: optional(string()),
	imageURL: optional(string()),
});

export const ASTAuthorComputable = type({
	name: eitherThunkOr(string()),
	url: optional(eitherThunkOr(string())),
	email: optional(eitherThunkOr(string())),
	imageURL: optional(eitherThunkOr(string())),
});

export const ASTAttachment = type({
	url: string(),
	mimeType: string(),
	title: optional(string()),
	sizeInBytes: optional(number()),
	durationInSeconds: optional(number()),
});

export const ASTAttachmentComputable = type({
	url: union([ StrThunk, string() ]),
	mimeType: union([ StrThunk, string() ]),
	title: optional(union([ StrThunk, string() ])),
	sizeInBytes: optional(union([ Thunk<number>(), number() ])),
	durationInSeconds: optional(union([ Thunk<number>(), number() ])),
});


export const ASTFeedItemJson = type({
	id: string(), // can also be the permalink
	url: string(), // permalink

	language: optional(string()),
	title: optional(string()),
	summary: optional(string()),

	content: object({
		html: optional(string()),
		text: optional(string()),
		markdown: optional(string()),
	}),

	images: object({
		indexImage: optional(string()),
		bannerImage: optional(string()), // layout above the post
	}),
	dates: object({
		published: optional(number()),
		modified: optional(number()),
	}),

	links: type({
		category: optional(string()),
		tags: optional(array(string())),
		externalURLs: optional(array(string())),
		nextPost: optional(string()),
		prevPost: optional(string()),
	}),

	authors: nonempty(array(ASTAuthor)),
	expires: optional(number()),

	attachments: optional(array(ASTAttachment)),

	_: optional(record(string(), unknown())), // for what?
	_rss: optional(record(string(), unknown())),
	_atom: optional(record(string(), unknown())),
	_sitemap: optional(record(string(), unknown())),
	__analysis: optional(record(string(), unknown())),
	__enhancement: optional(record(string(), unknown())),
});

export const ASTFeedItemThunk = type({
	id: eitherThunkOr(string()), // can also be the permalink
	url: eitherThunkOr(string()), // permalink

	language: optional(eitherThunkOr(string())),
	title: optional(eitherThunkOr(string())),
	summary: optional(eitherThunkOr(string())),

	content: object({
		html: optional(eitherThunkOr(string())),
		text: optional(eitherThunkOr(string())),
		markdown: optional(eitherThunkOr(string())),
	}),

	images: type({
		indexImage: optional(eitherThunkOr(string())),
		bannerImage: optional(eitherThunkOr(string())), // layout above the post
	}),
	dates: object({
		published: optional(union([ number(), Thunk<number>() ])),
		modified: optional(union([ number(), Thunk<number>() ])),
	}),

	_rss: optional(union([record(string(), unknown()), Thunk<Record<string, unknown>>()])),
	_atom: optional(union([record(string(), unknown()), Thunk<Record<string, unknown>>()])),
	_sitemap: optional(union([record(string(), unknown()), Thunk<Record<string, unknown>>()])),
	__analysis: optional(union([record(string(), unknown()), Thunk<Record<string, unknown>>()])),
	__enhancement: optional(union([record(string(), unknown()), Thunk<Record<string, unknown>>()])),

	links: type({
		nextPost: optional(eitherThunkOr(string())),
		prevPost: optional(eitherThunkOr(string())),
		category: optional(eitherThunkOr(string())),
		tags: optional(union([array(string()), Thunk<string[]>()])),
		externalURLs: optional(union([array(string()), Thunk<string[]>()])),
	}),

	authors: optional(union([
		nonempty(array(ASTAuthorComputable)),
		Thunk<s.Infer<typeof ASTAuthorComputable>[]>(),
	])),
	expires: optional(union([Thunk<number>(), number()])),

	attachments: optional(union([
		array(ASTAttachmentComputable),
		Thunk<typeof ASTAttachment.TYPE[]>(),
	])),
});

export const ASTKindJson = type({
	_meta: object({
		version: string(),
		reference: string(),
		comment: string(),
		sourceURL: string()
	}),

	title: string(),
	description: string(),
	language: string(),
	authors: nonempty(array(ASTAuthor)),

	images: partial(type({
		icon: string(),
		favicon: string(),
		bannerImage: string(),
	})),

	paging: partial(type({
		nextUrl: string(),
		prevUrl: string(),
		itemCount: number(),
	})),

	links: partial(type({
		// sourceURL: string()
		homeUrl: string(),
		feedUrl: string(),
	})),

	items: array(ASTFeedItemJson),

	eventStreamFromViewer: optional(object({
		tokenData: string(),
		feedEvents: optional(nonempty(array(EventStreamKind))),
	})),
	_rss: optional(record(string(), unknown())), // [tagName]: value
	_atom: optional(record(string(), unknown())),
	_sitemap: optional(record(string(), unknown())),
	__analysis: optional(record(string(), unknown())), // [pluginName]: {someObject or value}
	__enhancement: optional(record(string(), unknown())), // [pluginName]: {someObject or value}
});

const ASTimages = type({
	icon: eitherThunkOr(string()),
	bannerImage: eitherThunkOr(string()),
	favicon: eitherThunkOr(string()),
});

const ASTpaging = type({
	nextUrl: eitherThunkOr(string()),
	prevUrl: eitherThunkOr(string()),
	itemCount: union([Thunk<number>(), number()]),
});

const ASTlinks = type({
	homeUrl: eitherThunkOr(string()),
	feedUrl: eitherThunkOr(string()),
});

export const ASTKindComputable = type({
	_meta: optional(partial(object({
		version: eitherThunkOr(string()),
		reference: eitherThunkOr(string()),
		comment: eitherThunkOr(string()),
		sourceURL: eitherThunkOr(string()),
	}))),

	title: eitherThunkOr(string()),
	description: eitherThunkOr(string()),
	language: eitherThunkOr(string()),

	authors: union([
		Thunk<s.Infer<typeof ASTAuthor>[]>(),
		nonempty(array(ASTAuthor)),
	]),
	images: union([
		ASTimages,
		Thunk<s.Infer<typeof ASTimages>>(),
	]),

	paging: union([
		ASTpaging,
		Thunk<s.Infer<typeof ASTpaging>>(),
	]),

	links: union([
		ASTlinks,
		Thunk<s.Infer<typeof ASTlinks>>(),
	]),

	item: object({
		list: union([
			array(ASTFeedItemThunk),
			Thunk<typeof ASTFeedItemThunk.TYPE[]>(),
		]),
		next: Thunk<typeof ASTFeedItemThunk.TYPE[]>(),
	}),

	eventStreamFromViewer: optional(object({
		tokenData: eitherThunkOr(string()),
		feedEvents: optional(nonempty(array(EventStreamKind))),
	})),
	_rss: optional(union([record(string(), unknown()), Thunk<Record<string, unknown>>()])),
	_atom: optional(union([record(string(), unknown()), Thunk<Record<string, unknown>>()])),
	_sitemap: optional(union([record(string(), unknown()), Thunk<Record<string, unknown>>()])),
	__analysis: optional(union([record(string(), unknown()), Thunk<Record<string, unknown>>()])),
	__enhancement: optional(union([record(string(), unknown()), Thunk<Record<string, unknown>>()])),
});

type Thunk<T> = () => Promise<T>;
const rezVal = async <T>(i: T | Thunk<T>) => typeof i !== 'function' ? i : (i as Thunk<T>)();

export const computableToJson = async (
	ast: ASTcomputable | ASTjson,
	comment = '',
	ref = '',
	v = ''
): Promise<ASTjson> => {
	if('_meta' in ast){
		return ast as ASTjson
	}else{

		const [
			_meta   
			,_images       
			,_links     
			,_paging       
			,_item ] = await Promise.all([	rezVal(ast._meta),
											rezVal(ast.images),
											rezVal(ast.links),
											rezVal(ast.paging),
											rezVal(ast?.item) ])
		const _list = await rezVal(_item.list)
	
		return {
			_meta: {
				comment: await rezVal(_meta?.comment) ?? comment,
				reference: await rezVal(_meta?.reference) ?? ref,
				version: await rezVal(_meta?.version) ?? v,
				sourceURL: await rezVal(_meta?.sourceURL) ?? ''
			},
			title: await rezVal(ast.title),
			description: await rezVal(ast.description),
			language: await rezVal(ast.language),
			images: {
				bannerImage: await rezVal(_images.bannerImage),
				favicon: await rezVal(_images.favicon),
				icon: await rezVal(_images.icon),
			},
			links: {
				feedUrl: await rezVal(_links.feedUrl),
				homeUrl: await rezVal(_links.homeUrl),
			},
			paging: {
				itemCount: await rezVal(_paging.itemCount),
				nextUrl: await rezVal(_paging.nextUrl),
				prevUrl: await rezVal(_paging.prevUrl),
			},
			authors: await rezVal(ast.authors),
			items: await Promise.all((_list ?? []).map(async (i) => {
				return {
					title: await rezVal(i.title),
					summary: await rezVal(i.summary),
					language: await rezVal(i.language),
					url: await rezVal(i.url),
					id: await rezVal(i.id),
					authors: await rezVal(i.authors),
					content: {
						html: await rezVal(i.content.html),
						markdown: await rezVal(i.content.html),
						text: await rezVal(i.content.html),
					},
					images: {
						bannerImage: await rezVal(i.images.bannerImage),
						indexImage: await rezVal(i.images.indexImage),
					},
					dates: {
						published: await rezVal(i.dates.published),
						modified: await rezVal(i.dates.modified),
					},
					links: {
						category: await rezVal(i.links.category),
						tags: await rezVal(i.links.tags),
						nextPost: await rezVal(i.links.nextPost),
						prevPost: await rezVal(i.links.prevPost),
						externalURLs: await rezVal(i.links.externalURLs),
					},
					expires: await rezVal(i.expires),
					attachments: await rezVal(i.attachments),
				} as s.Infer<typeof ASTFeedItemJson>;
			})),
		};
	}
};

export type ASTjson = s.Infer<typeof ASTKindJson>;
export type ASTcomputable = s.Infer<typeof ASTKindComputable>;

export type ASTFactory = (input: ASTcomputable | ASTjson) => Promise<ASTjson>;
// deno-lint-ignore no-explicit-any
export type ASTkickstart = (...i: any[]) => Promise<ASTcomputable | ASTjson>;
export type AST = ASTcomputable;
