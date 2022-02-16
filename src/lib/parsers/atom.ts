import type { TypedValidator } from '../start.ts';
import type { IValidate } from '../../types.ts';
import { ASTcomputable, ASTjson, computableToJson } from '../parsers/ast.ts';
import { superstruct as s, toXml } from '../../mod.ts';

import {
	_text,
	_typedText,
	Generator,
	InnerText,
	TextOrHTML,
	txtorCData,
	TypedInnerText,
} from './helpers/composedPrimitives.ts';

const { union, define, partial, object, string, array, literal, optional } = s;

const Encoding = define<'utf-8'>(
	'Encoding',
	(s: unknown) => ['utf-8'].includes((s as string).toLowerCase()),
);

const Title = TypedInnerText;
const Subitle = TypedInnerText;
const ID = InnerText;

const Author = partial(object({
	name: partial(object({
		_text: string(), // prefer
		_cdata: string(),
	})),
	uri: partial(object({
		_text: string(), // prefer
		_cdata: string(),
	})),
	email: partial(object({
		_text: string(), // prefer
		_cdata: string(),
	})),
}));

export const Link = object({
	_attributes: partial(object({
		rel: string(),
		type: string(),
		hreflang: string(),
		href: string(),
	})),
});

export const Content = object({
	_attributes: object({
		type: TextOrHTML,
		'xml:base': optional(string()),
	}),
	_text: optional(string()),
	_cdata: optional(string()), //*
});

const Summary = Content;

const LinkSet = array(Link);

const LinkOrLinkSet = union([Link, LinkSet]);

// const MaybePersonOrSting = optional(union([string(), PersonKind]));

export const EntryKind = object({
	id: ID,
	title: union([Title, TypedInnerText]),
	link: LinkOrLinkSet,
	published: optional(InnerText),
	updated: optional(InnerText),
	author: optional(Author),
	summary: optional(Summary),
	content: optional(Content),
	_attributes: optional(object({
		// xmlns: literal("http://www.w3.org/2005/Atom"),
		'xml:lang': optional(string()), //* default to?? 'en-US' | 'en'
	})),
	// name: optional(string()),
	// email: optional(string()),
	// uri: optional(string()),
});

export const AtomFeedKind = object({
	title: Title,
	updated: InnerText,
	link: LinkOrLinkSet,
	entry: array(EntryKind),
	// id: ID,
	//
	_attributes: optional(object({
		xmlns: literal('http://www.w3.org/2005/Atom'),
		'xml:lang': optional(string()), //* default to?? 'en-US' \ 'en'
	})),
	id: optional(ID),
	generator: optional(union([InnerText, Generator])),
	icon: optional(union([string(), InnerText])),
	logo: optional(union([string(), InnerText])),
	subtitle: optional(Subitle),
	author: optional(Author),
	contributor: optional(array(Author)),
	category: optional(array(string())),
	rights: optional(InnerText),
});

export const AtomResponse = object({
	_declaration: object({
		_attributes: object({
			version: string(),
			encoding: Encoding,
		}),
	}),
	feed: AtomFeedKind,
});

type ValidationReturn<T> =
	| ValidationReturnClean<T>
	| ValidationReturnWithErr<T>;
type ValidationReturnClean<T> = [null, T];
type ValidationReturnWithErr<T> = [s.StructError, T | null];

type ValidationError = s.StructError | undefined;

export type RespStruct = typeof AtomResponse.TYPE;
// export type AtomValidator = IValidate<RespStruct> extends IValidate

const pickURL = (fallback: string, link: typeof LinkOrLinkSet.TYPE) => {
	return Array.isArray(link)
		? link.filter((l: s.Infer<typeof Link>) => l._attributes.rel === 'self')[0]._attributes.href ??
			fallback
		: link._attributes.href ?? fallback;
};

export const Atom = ((
	compactParse: RespStruct | unknown,
	url: string,
): IValidate<RespStruct> => {
	const structs = {
		feed: AtomFeedKind,
		response: AtomResponse,
	};

	return {
		url,
		inputKind: 'atom',
		clone: Atom,
		_: compactParse as RespStruct,
		paginateFrom: (pos: number = 0, offset: number = 50) => {
			return Promise.resolve({
				val: compactParse as RespStruct,
				canPrev: false,
				canNext: false,
			});
		},
		prev: () =>
			Promise.resolve({
				val: compactParse as RespStruct,
				canNext: false,
				canPrev: false,
			}),
		next: () =>
			Promise.resolve({
				val: compactParse as RespStruct,
				canNext: false,
				canPrev: false,
			}),
		validate: (): Promise<RespStruct> => {
			let err: ValidationError;
			let validated: unknown;

			if (typeof compactParse === 'string') {
				return Promise.reject({
					error: true,
					compactParse,
					err: new Error().stack,
					reason: `parse before validating`,
				});
			}

			if ((compactParse as typeof AtomResponse.TYPE).feed) {
				[err, validated] = structs.response.validate(compactParse, {
					coerce: true,
				});

				if (validated) {
					return Promise.resolve(validated as typeof AtomResponse.TYPE);
				} else if (err) {
					return Promise.reject({
						error: true,
						compactParse,
						reason: `Atom: validation application error : ${err}`,
						err,
					});
				} else {
					return Promise.reject({
						error: true,
						compactParse,
						reason: `Atom: validation application error`,
						err: new Error().stack,
					});
				}
			} else {
				return Promise.reject({
					error: true,
					compactParse,
					reason: `Atom: string structure lacks a feed tag within the xml to parse`,
					err: new Error().stack,
				});
			}
		},
		fromAST: async (_ast: ASTcomputable | ASTjson): Promise<RespStruct> => {
			const ast = await computableToJson(_ast);
			const version = (ast?._atom?._declaration as any)?._attributes?.version as string | undefined;
			const xmlLang = (ast?._atom?.feed as any)._attributes['xml:lang'] ?? 'en-US' as string;

			return {
				_declaration: {
					_attributes: { encoding: 'utf-8', version: version },
				},
				feed: {
					_attributes: {
						xmlns: 'http://www.w3.org/2005/Atom',
						'xml:lang': xmlLang,
					},
					title: _typedText(ast.title),
					subtitle: _typedText(ast.description),
					link: [{
						_attributes: {
							href: '',
							hreflang: '',
							rel: '',
							type: '',
						},
					}],
					updated: _text(
						Math.max(
							...ast.items.map((i) => {
								const p = i.dates?.published ?? 0;
								const m = i.dates?.modified ?? 0;
								return m > p ? m : p;
							}),
						).toString(),
					),
					...(ast.authors?.[0]
						? {
							author: {
								email: _typedText(ast.authors[0].email),
								name: _typedText(ast.authors[0].name),
								uri: _typedText(ast.authors[0].url),
							},
						}
						: {}),
					...(ast._atom?.contributors
						? {
							contributor: (ast._atom?.contributors as (typeof Author.TYPE)[])?.map((c) => {
								return {
									email: _typedText(c.email?._text ?? c.email?._cdata),
									name: _typedText(c.name?._text ?? c.name?._cdata),
									uri: _typedText(c.uri?._text ?? c.uri?._cdata),
								};
							}),
						}
						: {}),
					category: [] as string[],
					icon: _text(ast.images.favicon),
					logo: _text(ast.images.icon),
					// generator: { _attributes: { uri: '', version: '' }, _cdata: '', _text: '' },
					id: _text(ast.links.feedUrl),
					...(
						ast._rss?.rights ? { rights: _text(ast._rss?.rights as string | undefined) } : {}
					),
					entry: ast.items.map((i) => {
						return {
							_attributes: { 'xml:lang': 'en-US' },
							title: _typedText(i.title),
							summary: _typedText(i.summary),

							link: { _attributes: { href: '', hreflang: '', rel: '', type: '' } },
							updated: _text(new Date(i.dates?.modified ?? 0).toISOString()),
							id: _text(i.id),

							author: { email: _text(), name: { _text: '' }, uri: { _text: '' } },
							content: { _attributes: { type: 'html' }, _text: '', _cdata: '' },
							published: { _text: '' },
						};
					}),
				},
			} as RespStruct;
		},
		toString: () => {
			return toXml.js2xml(compactParse as RespStruct, { compact: true });
		},
		/**
		 * Contains logic to get the Syntax to an AST repr
		 * @returns ASTShell
		 */
		toAST: async (): Promise<ASTcomputable> => {
			const c = await compactParse as RespStruct;
			return {
				_meta: {
					_type: 'computable',
					sourceURL: url,
				},
				title: txtorCData('>> no title << ', c.feed.title),
				description: txtorCData('>> no description <<', c.feed.subtitle),
				language: c.feed._attributes?.['xml:lang'] ?? 'en-US',
				authors: [{
					name: txtorCData('_missing name', c.feed.author?.name),
					url: txtorCData('_missing url', c.feed.author?.uri),
					email: txtorCData('_missing email', c.feed.author?.email),
				}],
				images: {
					favicon: typeof c.feed.logo === 'string' ? c.feed.logo : c.feed.logo?._text ?? '',
					icon: typeof c.feed.logo === 'string' ? c.feed.logo : c.feed.logo?._text ?? '',
					bannerImage: typeof c.feed.logo === 'string' ? c.feed.logo : c.feed.logo?._text ?? '',
				},
				links: async () => {
					const links = Array.isArray(c.feed.link) ? c.feed.link : [c.feed.link];
					const homeUrl = links.filter((l) =>
						l._attributes.rel === 'alternate'
					)[0]._attributes.href ?? '';
					const sourceURL = links.filter((l) => l._attributes.rel === 'self')[0]._attributes.href ??
						'';
					const feedUrl = links.filter((l) => l._attributes.rel === 'self')[0]._attributes.href ??
						'';
					return {
						feedUrl,
						homeUrl,
						sourceURL,
						list: links.map((l) => {
							return {
								href: l._attributes.href ?? '',
								hreflang: l._attributes.hreflang ?? '',
								rel: l._attributes.rel ?? '',
								type: l._attributes.type ?? '',
							};
						}),
					};
				},
				paging: {
					itemCount: c.feed.entry.length,
					nextUrl: async () => '',
					prevUrl: async () => '',
				},
				_atom: {},
				entitlements: [],
				sourceFeedMeta: async () => {
					return {
						generator: {
							name: c.feed.generator?._text,
						},
					};
				},
				item: {
					next: async () => [],
					list: (c.feed.entry ?? []).map((i: s.Infer<typeof EntryKind>) => ({
						id: i.id?._text ?? pickURL('>> no link provided', i.link),
						url: pickURL('>> no link provided', i.link),
						title: txtorCData('', i.title),
						summary: i.summary?._cdata ?? i.summary?._text ?? '>> no summary <<',
						language: i._attributes?.['xml:lang'] ?? 'en-US',
						authors: [{
							name: txtorCData('', i.author?.name),
							email: txtorCData('', i.author?.email),
							url: txtorCData('', i.author?.uri),
						}],
						links: {
							category: 'uncategorized',
							tags: [],
							externalURLs: [],
							nextPost: '',
							prevPost: '',
						},
						content: {
							html: i.content?._cdata,
							makrdown: '',
							text: i.content?._text,
						},
						dates: {
							modified: i.updated?._text ? new Date(i.updated._text).getTime() : Date.now(),
							published: i.published?._text ? new Date(i.published._text).getTime() : Date.now(),
						},
						images: {
							bannerImage: '',
							indexImage: '',
						},
						attachments: [],
						expires: undefined,
						_atom: {},
					})),
				},
			};
		},
	};
}) as TypedValidator;
