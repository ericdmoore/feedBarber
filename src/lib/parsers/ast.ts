import type { IDictValidPayloadTypes, ISupportedTypes } from '../pickType.ts';

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
): Promise<AST> => {
	switch (preValidatecdInput.kind) {
		case 'atom':
			return await atom.Atom(preValidatecdInput.data).toAST();
		case 'rss':
			return await rss.Rss(preValidatecdInput.data).toAST();
		case 'jsonFeed':
			return await jsonFeed.JsonFeed(preValidatecdInput.data).toAST();
		case 'sitemap':
			return await sitemap.Sitemap(preValidatecdInput.data).toAST();
		default:
			return {} as never;
	}
};

const astToShell = async (
	parser: IValidate<ISupportedTypes>,
	ast?: AST,
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
		// items: {
		// 	stream: () => {},
		// 	asyncIter: () => {},
		//  all: () => {}
		// },
		next: async () => {
			const { val } = await parser.next();
			ast = await parser.clone(val).toAST()
			return astToShell(parser, ast, pos);
		},
		prev: async () => {
			const { val } = await parser.prev();
			ast = await parser.clone(val).toAST()
			return astToShell(parser, ast, pos);
		},
		use: async (fns) => {
			return fns.reduce(
				async (p, f) => f(await p),
				astToShell(
					parser,
					ast ?? await parser.toAST(),
					pos,
				),
			);
		},
		toXML: () => {
			// ast ? parser.fromAST(ast).toXml() : parser.
			return ''
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

export const ASTFeedItemJson = type({
	id: string(), // can also be the permalink
	url: string(), // permalink

	language: optional(string()),
	title: optional(string()),
	summary: optional(string()),

	content: object({
		html: optional(string()),
		text: optional(string()),
		makrdown: optional(string()),
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
	
	_: record(string(), unknown()),
	_rss: record(string(), unknown()),
	_atom: record(string(), unknown()),
	_sitemap: record(string(), unknown()),
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
		makrdown: optional(eitherThunkOr(string())),
	}),

	images: type({
		indexImage: optional(eitherThunkOr(string())),
		bannerImage: optional(eitherThunkOr(string())), // layout above the post
	}),
	dates: object({
		published: optional(union([
			number(),
			Thunk<number>(),
		])),
		modified: optional(union([
			number(),
			Thunk<number>(),
		])),
	}),
	
	_rss: optional(union([ record(string(), unknown()), Thunk<Record<string, unknown>>() ])),
	_atom: optional(union([ record(string(), unknown()), Thunk<Record<string, unknown>>() ])),
	_sitemap: optional(union([ record(string(), unknown()), Thunk<Record<string, unknown>>() ])),
	__analysis: optional(union([ record(string(), unknown()), Thunk<Record<string, unknown>>() ])),
	__enhancement: optional(union([ record(string(), unknown()), Thunk<Record<string, unknown>>() ])),

	links: type({
		nextPost: optional(eitherThunkOr(string())),
		prevPost: optional(eitherThunkOr(string())),
		category: optional(eitherThunkOr(string())),
		tags: optional(union([ array(string()), Thunk<string[]>() ])),
		externalURLs: optional(union([ array(string()), Thunk<string[]>() ])),
	}),

	authors: optional(union([
		nonempty(array(ASTAuthor)),
		Thunk<typeof ASTAuthor.TYPE[]>(),
	])),
	expires: optional(union([Thunk<number>(), number()])),

	attachments: optional(union([
		array(ASTAttachment),
		Thunk<typeof ASTAttachment.TYPE[]>(),
	])),
});

export const ASTKindJson = type({
	_meta: type({
		version: string(),
		reference: string(),
		comment: string(),
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
		homeUrl: string(),
		feedUrl: string(),
	})),

	items: array(ASTFeedItemJson),

	eventStreamFromViewer: optional(object({
		tokenData: string(),
		feedEvents: optional(nonempty(array(EventStreamKind))),
	})),
	_rss: optional(  record(string(), unknown()) ), // [tagName]: value
	_atom: optional(  record(string(), unknown()) ),
	_sitemap: optional(  record(string(), unknown()) ),
	__analysis: optional(  record(string(), unknown()) ), // [pluginName]: {someObject or value}
	__enhancement: optional(  record(string(), unknown()) ), // [pluginName]: {someObject or value}
});

export const ASTKindComputable = type({
	title: eitherThunkOr(string()),
	description: eitherThunkOr(string()),
	language: eitherThunkOr(string()),

	authors: union([
		Thunk<s.Infer<typeof ASTAuthor>[]>(),
		nonempty(array(ASTAuthor)),
	]),

	images: eitherThunkOr(type({
		icon: eitherThunkOr(string()),
		bannerImage: eitherThunkOr(string()),
		favicon: eitherThunkOr(string()),
	})),

	paging: eitherThunkOr(type({
		nextUrl: eitherThunkOr(string()),
		prevUrl: eitherThunkOr(string()),
		itemCount: union([Thunk<number>(), number()]),
	})),

	links: eitherThunkOr(type({
		homeUrl: eitherThunkOr(string()),
		feedUrl: eitherThunkOr(string()),
	})),

	items: union([
		Thunk<typeof ASTFeedItemThunk.TYPE[]>(),
		array(ASTFeedItemThunk),
	]),

	eventStreamFromViewer: optional(object({
		tokenData: eitherThunkOr(string()),
		feedEvents: optional(nonempty(array(EventStreamKind))),
	})),
	_rss: optional(union([ record(string(), unknown()), Thunk<Record<string, unknown>>() ])),
	_atom: optional(union([ record(string(), unknown()), Thunk<Record<string, unknown>>() ])),
	_sitemap: optional(union([ record(string(), unknown()), Thunk<Record<string, unknown>>() ])),
	__analysis: optional(union([ record(string(), unknown()), Thunk<Record<string, unknown>>() ])),
	__enhancement: optional(union([ record(string(), unknown()), Thunk<Record<string, unknown>>() ])),
});

export type ASTjson = s.Infer<typeof ASTKindJson>;
export type ASTcomputable = s.Infer<typeof ASTKindComputable>;

export type ASTFactory = (input: ASTcomputable | ASTjson) => Promise<ASTjson>;
// deno-lint-ignore no-explicit-any
export type ASTkickstart = (...i: any[]) => Promise<ASTcomputable | ASTjson>;
export type AST = ASTcomputable;
