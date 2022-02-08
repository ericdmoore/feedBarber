// define the expected atom shape
// perform the fetch
// validate the response

import type { ISupportedTypes, TypedValidator } from '../start.ts';

import { ASTcomputable, ASTjson, computableToJson } from './ast.ts';
import { superstruct, toXml } from '../../mod.ts';
import { IValidate } from '../../types.ts';

import { JsonFeed } from './jsonFeed.ts';
import { Atom } from './atom.ts';

import er from './helpers/error.ts';
import {
	Enclosure,
	Generator,
	GUID,
	InnerText,
	Link,
	OptInnerText,
	txtorCData,
	TypedInnerText,
	CDataInnerText
} from './helpers/composedPrimitives.ts';

const {
	union,
	object,
	string,
	array,
	optional,
	type
} = superstruct;

const Category = type({
	_attributes: type({ domain: string() }),
	_cdata: string(),
	_text: string()
})

export const RssItem = type({
	title: optional(CDataInnerText),
	link: InnerText,
	guid: GUID,
	comments: optional(InnerText),
	'dc:creator': optional(TypedInnerText),
	pubDate: optional(InnerText),
	category: optional( union([ TypedInnerText, array(TypedInnerText) ])),
	description: optional(TypedInnerText),
	'content:encoded': optional(TypedInnerText),
	'wfw:commentRss': optional(InnerText),
	'slash:comments': optional(InnerText),
	'atom:link': optional(TypedInnerText),
	enclosure: optional(union([Enclosure, array(Enclosure)])),
});

export const RssResponse = type({
	_instruction: optional(union([
		type({ "xml-stylesheet": string() }),
		array(type({ "xml-stylesheet": string() }))
	])),
	_declaration: object({
		_attributes: object({
			version: optional(string()),
			encoding: optional(string()),
			standalone: optional(string()),
		}),
	}),
	rss: object({
		meta: optional(type({
			_attributes: type({
				content: string(),
				name: string()
			})
		})),
		_attributes: type({
			version: optional(string()),
			'xmlns:atom': optional(string()),
			'xmlns:content': optional(string()),
			'xmlns:wfw': optional(string()),
			'xmlns:dc': optional(string()),
			'xmlns:sy': optional(string()),
			'xmlns:slash': optional(string()),
			'xmlns:georss': optional(string()),
			'xmlns:geo': optional(string()),
		}),
		channel: type({
			title: optional(InnerText),
			link: InnerText,
			image: optional(type({url: OptInnerText, title: OptInnerText, link: OptInnerText})),
			description: optional( union([ OptInnerText, CDataInnerText ])),
			generator: optional(Generator),
			language: optional(OptInnerText),
			copyright: optional(OptInnerText),
			lastBuildDate: optional(OptInnerText),
			'atom:link': optional(Link),
			'sy:updatePeriod': optional(OptInnerText),
			'sy:updateFrequency': optional(OptInnerText),
			item: array(RssItem),
		}),
	}),
});

export type RespStruct = typeof RssResponse.TYPE;

export const Rss = ((
	compactParse: RespStruct | unknown,
	url: string
): IValidate<RespStruct> => {
	const structs = {
		response: RssResponse,
		item: RssItem,
	};
	return {
		inputKind: 'rss',
		validate: (): Promise<RespStruct> => {
			let err: superstruct.StructError | undefined;
			let validated: unknown;

			if (typeof compactParse === 'string') {
				return Promise.reject(er(compactParse, '', new Error().stack));
			}
			if (compactParse == null) {
				return Promise.reject(
					er(compactParse, 'got a null', new Error().stack),
				);
			}

			if ((compactParse as RespStruct).rss) {
				[err, validated] = structs.response.validate(compactParse, {
					coerce: true,
				});

				if (validated && !err) {
					return Promise.resolve(validated as RespStruct);
				} else if (err) {
					return Promise.reject(
						er(
							compactParse,
							'RSS: validation application error',
							err.toString(),
						),
					);
				} else {
					return Promise.reject(
						er(
							compactParse,
							'RSS: validation application error',
							new Error().stack,
						),
					);
				}
			} else {
				return Promise.reject(
					er(
						compactParse,
						`RSS: string structure lacks an rss tag within the xml to parse`,
						new Error().stack,
					),
				);
			}
		},
		clone: Rss,
		_: compactParse as RespStruct,
		paginateFrom: (pos: number = 0, pageBy: number = 50) => {
			return Promise.resolve({
				val: compactParse as RespStruct,
				canPrev: false,
				canNext: false,
			});
		},
		next: () => {
			return Promise.resolve({
				val: compactParse as RespStruct,
				canNext: false,
				canPrev: false,
			});
			// does it support next/prev?
		},
		prev: () => {
			return Promise.resolve({
				val: compactParse as RespStruct,
				canNext: false,
				canPrev: false,
			});
		},
		toXML: (): string => {
			return toXml.js2xml(compactParse as RespStruct, { compact: true });
		},
		exportAs: async (type: 'rss' | 'atom' | 'jsonfeed'): Promise<string> => {
			const ast = await Rss(compactParse, url).toAST() as ASTcomputable;

			switch (type) {
				case 'rss':
					return Rss(await Rss<RespStruct>({}, url).fromAST(ast), url).toXML();
				case 'atom':
					return Atom(await Atom({}, url).fromAST(ast), url).toXML();
				case 'jsonfeed':
					return JsonFeed(await JsonFeed({}, url).fromAST(ast), url).toXML();
			}
		},
		fromAST: async (_ast: ASTcomputable |ASTjson): Promise<RespStruct> => {
			const ast = await computableToJson(_ast);
			const g = ast?._rss?.generator as {
				_attributes: { uri?: string; version?: string };
				_cdata: string;
				_text: string;
			} | undefined;

			return {
				_declaration: {
					_attributes: {
						version: ast._rss?.version as string | undefined,
					},
				},
				rss: {
					_attributes: {
						'xmlns:atom': ast._rss?.['xmlns:atom'] as string | undefined,
						'xmlns:content': ast?._rss?.['xmlns:atom'] as string | undefined,
						'xmlns:dc': ast?._rss?.['xmlns:atom'] as string | undefined,
						'xmlns:geo': ast?._rss?.['xmlns:atom'] as string | undefined,
						'xmlns:georss': ast?._rss?.['xmlns:atom'] as string | undefined,
						'xmlns:slash': ast?._rss?.['xmlns:atom'] as string | undefined,
						'xmlns:sy': ast?._rss?.['xmlns:atom'] as string | undefined,
						'xmlns:wfw': ast?._rss?.['xmlns:atom'] as string | undefined,
						version: ast?._rss?.version as string | undefined,
					},
					channel: {
						link: { _text: ast.links.feedUrl ?? '' },
						title: { _text: ast.title },
						description: { _text: ast.description },
						generator: {
							_attributes: {
								uri: g?._attributes?.uri,
								version: g?._attributes?.version,
							},
							_cdata: g?._cdata,
							_text: g?._text,
						},
						item: await Promise.all(ast.items.map(async (i) => {
							return {
								title: { _text: i.title ?? '' },
								link: { _text: i.url ?? '' },
								guid: { _text: i.id ?? '' },
								description: { _text: i.summary ?? '' },
								'content:encoded': { _text: '' },
								'dc:creator': {
									_attributes: { type: 'text' },
									_cdata: '',
									_text: '',
								},
								'slash:comments': { _text: '' },
								'wfw:commentRss': { _text: '' },
								category: { _attributes: {}, _cdata: '', _text: '' },
								comments: { _text: '' },
								enclosure: [{
									_attributes: {
										url: '',
										length: '',
										type: '',
									},
								}],
							};
						})),
					},
				},
			};
		},
		toAST: async (): Promise<ASTcomputable> => {
			const c = compactParse as RespStruct;
			return {
				_meta:{
					sourceURL: url
				},
				title: c.rss.channel?.title?._text ?? c.rss.channel.link?._text ?? '>> no title given',
				description: c.rss.channel.description?._text ?? '>> no description',
				authors: [],
				images: {
					favicon: '',
					icon: '',
					bannerImage: '',
				},
				language: 'en-US',
				links: {
					feedUrl: c.rss.channel.link?._text ?? '',
					homeUrl: c.rss.channel.link?._text ?? '',
				},
				paging: {
					itemCount: c.rss.channel.item.length,
					nextUrl: '',
					prevUrl: '',
				},
				_rss: {
					// all your other rss stuff
				},
				item: {
					next: async () => [],
					list: (c.rss.channel.item ?? []).map((i) => {
						return {
							title: txtorCData('', i.title),
							summary: txtorCData('', i.description),
							language: txtorCData('en-US', c.rss.channel.language),
							url: txtorCData('_gone', i.link),
							id: txtorCData('_gone', i.guid),
							authors: [{
								name: txtorCData('>>anonymous<<', i['dc:creator']),
								email: undefined,
								url: undefined,
								imageURL: undefined,
							}],
							content: {
								htmlL: txtorCData('Err: 105 - Missing Content', i['content:encoded']),
								makrdown: undefined,
								text: undefined,
							},
							images: {
								indexImage: undefined,
								bannerImage: undefined,
							},
							dates: { published: 0, modified: 0 },
							links: {
								category: Array.isArray(i.category) ? txtorCData('', i.category[0]) : txtorCData('', i.category),
								nextPost: undefined,
								prevPost: undefined,
								tags: Array.isArray(i.category) 
									? i.category.map((c)=>txtorCData('>> couldNotFindTagInfo', c)) 
									: i.category 
										? [ txtorCData('', i.category)] 
										: [],
								externalURLs: [],
							},
							_rss: {},
							expires: undefined,
							attachments: Array.isArray(i.enclosure)
								? i.enclosure.filter((e) => e?._attributes.type && e?._attributes.url).map((e) => {
									return {
										durationInSeconds: 0,
										sizeInBytes:
											e?._attributes.length && !Number.isNaN(Number.parseInt(e?._attributes.length))
												? Number.parseInt(e?._attributes.length)
												: undefined,
										mimeType: e?._attributes.type as string,
										url: e?._attributes.url as string,
										title: e?._attributes.url as string,
									};
								})
								: i.enclosure?._attributes.type && i.enclosure?._attributes.url
								? [{
									durationInSeconds: 0,
									sizeInBytes: i.enclosure?._attributes.length &&
											!Number.isNaN(Number.parseInt(i.enclosure?._attributes.length))
										? Number.parseInt(i.enclosure?._attributes.length)
										: undefined,
									mimeType: i.enclosure?._attributes.type ?? '',
									url: i.enclosure?._attributes.url ?? '',
									title: i.enclosure?._attributes.url ?? '',
								}]
								: [],
						};
					}),
				},
			};
		},
	};
}) as TypedValidator;
