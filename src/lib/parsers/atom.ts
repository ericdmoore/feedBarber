// define the expected atom shape
// perform the fetch
// validate the response

// input types - super loose
// output type - as tight as we can make it
//
//
// Output Fix NUmber1...
//
// Content:
// _attributes
//   type: "html"
// _text: () => 'move to _cdata'
// _cdata
import type { ASTcomputable } from '../parsers/ast.ts';
import { superstruct as s, toXml } from '../../mod.ts';
import { IValidate } from '../../types.ts';
import { Generator, InnerText, TextOrHTML, TypedInnerText, txtorCData } from './helpers/composedPrimitives.ts';
// number, is
const { union, define, partial, object, string, array, literal, optional } = s;

const Encoding = define<'utf-8'>(
	'Encoding',
	(s: unknown) => ['utf-8'].includes((s as string).toLowerCase()),
);

const Title = TypedInnerText;
const Subitle = TypedInnerText;

const ID = InnerText;
// const Updated = InnerText;

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

export const Atom = (
	compactParse = {} as RespStruct | unknown,
): IValidate<RespStruct> => {
	const structs = {
		feed: AtomFeedKind,
		response: AtomResponse,
	};

	return {
		_: compactParse as RespStruct,
		inputKind: 'atom',
		clone: Atom,
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
		toXML: () => {
			return toXml.js2xml(compactParse as typeof AtomResponse.TYPE, {
				compact: true,
			});
		},
		/**
		 * Contains logic to get the Syntax to an AST repr
		 * @returns ASTShell
		 */
		toAST: async (): Promise<ASTcomputable> => {
			const c = await compactParse as RespStruct;
			return {
				title: txtorCData('>> no title << ', c.feed.title),
				description: txtorCData( '>> no description <<', c.feed.subtitle),
				language: 'en-US',
				authors: [{
					name: txtorCData('', c.feed.author?.name),
					url: txtorCData('', c.feed.author?.uri),
					email: txtorCData('', c.feed.author?.email),
				}],
				images: {
					favicon: typeof c.feed.logo === 'string' ? c.feed.logo : c.feed.logo?._text ?? '',
					icon: typeof c.feed.logo === 'string' ? c.feed.logo : c.feed.logo?._text ?? '',
					bannerImage: typeof c.feed.logo === 'string' ? c.feed.logo : c.feed.logo?._text ?? ''
				},
				links: {
					feedUrl: async () => '',
					homeUrl: Array.isArray(c.feed.link)
						? c.feed.link.filter((l: s.Infer<typeof Link>) => l._attributes.rel === 'self')[0]
							._attributes.href ?? ''
						: c.feed.link._attributes.href ?? '',
				},
				paging: {
					itemCount: c.feed.entry.length,
					nextUrl: async () => '',
					prevUrl: async () => '',
				},
				items: (c.feed.entry ?? []).map((i: s.Infer<typeof EntryKind>) => ({
					id: i.id._text,
					url: Array.isArray(i.link)
						? i.link.filter((l: s.Infer<typeof Link>) => l._attributes.rel === 'self')[0]
							._attributes.href ?? ''
						: i.link._attributes.href ?? '',
					title: i.title._text ?? i.title._cdata ?? '',
					summary: i.summary?._cdata ?? i.summary?._text ?? '>> no summary <<',
					language: 'en-US',
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
						text: i.content?._text
					},
					dates: {
						modified: i.updated ? new Date(i.updated._text).getTime() : Date.now(),
						published: i.published ? new Date(i.published._text).getTime() : Date.now(),
					},
					images: {
						bannerImage: '',
						indexImage: '',
					},
					attachments: [],
					expires: undefined,
				})),
			};
		},
	};
};
