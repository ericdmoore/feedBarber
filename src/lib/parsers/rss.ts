// define the expected atom shape
// perform the fetch
// validate the response

import type { ASTcomputable } from './ast.ts';
import type { ISupportedTypes, TypedValidator } from '../pickType.ts';
import { superstruct, toXml } from '../../mod.ts';
import { IValidate } from '../../types.ts';
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
} from './helpers/composedPrimitives.ts';

// number, is
const { union, is, define, partial, object, string, array, literal, optional } = superstruct;

export const RssItem = object({
	title: InnerText,
	link: InnerText,
	guid: GUID,
	comments: optional(InnerText),
	'dc:creator': optional(TypedInnerText),
	pubDate: optional(InnerText),
	category: optional(TypedInnerText),
	description: TypedInnerText,
	'content:encoded': optional(TypedInnerText),
	'wfw:commentRss': optional(InnerText),
	'slash:comments': optional(InnerText),
	enclosure: optional(union([Enclosure, array(Enclosure)])),
});

export const RssResponse = object({
	_declaration: object({
		_attributes: object({
			version: optional(string()),
			encoding: optional(string()),
			standalone: optional(string()),
		}),
	}),
	rss: object({
		_attributes: object({
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
		channel: object({
			title: InnerText,
			link: InnerText,
			description: optional(OptInnerText),
			generator: optional(Generator),
			language: optional(OptInnerText),
			lastBuildDate: optional(OptInnerText),
			'atom:link': optional(Link),
			'sy:updatePeriod': optional(OptInnerText),
			'sy:updateFrequency': optional(OptInnerText),
			item: array(RssItem),
		}),
	}),
});

export type RespStruct = typeof RssResponse.TYPE;

export const Rss: TypedValidator = (
	compactParse: RespStruct | unknown,
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
		// fromAST: async():Promise<RespStruct> =>  { },
		toAST: async (): Promise<ASTcomputable> => {
			const c = compactParse as RespStruct;
			return {
				title: c.rss.channel.title._text,
				description: c.rss.channel.description?._text ?? '',
				authors: [],
				images: {
					favicon: '',
					icon: '',
					bannerImage: '',
				},
				language: 'en-US',
				links: {
					feedUrl: c.rss.channel.link._text,
					homeUrl: c.rss.channel.link._text,
				},
				paging: {
					itemCount: 0,
					nextUrl: '',
					prevUrl: '',
				},
				_rss: {},
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
								category: txtorCData('', i.category),
								nextPost: undefined,
								prevPost: undefined,
								tags: [],
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
};
