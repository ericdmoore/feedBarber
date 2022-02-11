// define the expected atom shape
// perform the fetch
// validate the response

import type { IValidate } from '../../types.ts';
import type { ISupportedTypes, TypedValidator } from '../start.ts';
import { superstruct as s, toXml } from '../../mod.ts';
import type { ASTcomputable, ASTjson } from './ast.ts';
import er from './helpers/error.ts';

const {
	number,
	union,
	literal,
	optional,
	type,
	object,
	string,
	array,
	boolean,
	record,
} = s;
// define,

export const JsonFeedAuthor = type({
	name: string(),
	url: optional(string()),
	avatar: optional(string()),
});

export const JsonAttachments = type({
	url: string(),
	mime_type: string(),
	title: optional(string()),
	size_in_bytes: optional(number()),
	duration_in_seconds: optional(number()),
});

export const JsonFeedItem = type({
	id: string(), // can also be the permalink
	url: string(), // permalink
	external_url: optional(string()), //
	title: optional(string()),
	content_html: optional(string()),
	content_text: optional(string()),
	content_makrdown: optional(string()),
	summary: optional(string()),
	image: optional(string()),
	banner_image: optional(string()), // layout above the post
	date_published: optional(string()), // ISO fmt
	date_modified: optional(string()), // ISO fmt
	language: optional(string()),
	tags: optional(array(string())),
	author: optional(JsonFeedAuthor),
	authors: optional(array(JsonFeedAuthor)),
	attachments: optional(array(JsonAttachments)),
	_eventStreamFromViewer: optional(object({
		tokenData: string(),
		feedEvents: object({
			available: array(string()),
			defaultUrl: string(),
		}),
		events: record(
			union([
				literal('read'),
				literal('share'),
			]),
			object({
				ts: number(),
				feedUri: string(),
				postUri: string(),
			}),
		),
	})),
});

export const JsonFeedKind = type({
	version: string(),
	title: string(),
	home_page_url: string(),
	feed_url: string(), // import meta.url
	items: array(JsonFeedItem),
	author: optional(JsonFeedAuthor),
	authors: optional(array(JsonFeedAuthor)),
	description: optional(string()), // of feed
	user_comment: optional(string()), // developer comment
	next_url: optional(string()), //
	icon: optional(string()), //
	favicon: optional(string()),
	language: optional(string()),
	expired: optional(boolean()),
	hubs: optional(array(object({
		type: string(),
		url: string(),
	}))),
});

export type RespStruct = typeof JsonFeedKind.TYPE;

export const JsonFeed = ((
	compactParse: RespStruct | unknown,
	url: string,
): IValidate<RespStruct> => {
	const structs = { response: JsonFeedKind };

	return {
		url,
		inputKind: 'jsonfeed',
		_: compactParse as RespStruct,
		clone: JsonFeed,
		validate: (): Promise<RespStruct> => {
			let err: s.StructError | undefined;
			let validated: unknown;

			if (typeof compactParse === 'string') {
				return Promise.reject(
					er(
						compactParse,
						'JsonFeed: must passe the string before validation',
						new Error().stack,
					),
				);
			}
			if (compactParse == null) {
				return Promise.reject(
					er(
						compactParse,
						'JsonFeed: found null input',
						new Error().stack,
					),
				);
			}

			if ('items' in (compactParse as RespStruct)) {
				[err, validated] = structs.response.validate(compactParse, {
					coerce: true,
				});

				if (validated && !err) {
					return Promise.resolve(validated as RespStruct);
				} else if (err) {
					return Promise.reject(
						er(
							compactParse,
							'JsonFeed: validation application error',
							err.toString(),
						),
					);
				} else {
					return Promise.reject(
						er(
							compactParse,
							'JsonFeed: validation application error',
							new Error().stack,
						),
					);
				}
			} else {
				return Promise.reject(
					er(
						compactParse,
						'string structure lacks a `feed` tag within the parsed payload',
						new Error().stack,
					),
				);
			}
		},
		/**
		 * @param pos - starting positi0on
		 * @param pageBy - intteger value (pos|neg) indicating the page size and direction from the starting position
		 * @returns
		 */
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
				canPrev: false,
				canNext: false,
			});
		},
		prev: () => {
			return Promise.resolve({
				val: compactParse as RespStruct,
				canPrev: false,
				canNext: false,
			});
		},
		toXML: () => {
			return toXml.js2xml(compactParse as RespStruct, { compact: true });
		},
		fromAST: async (input: ASTcomputable | ASTjson): Promise<RespStruct> => {
			return compactParse as RespStruct;
		},
		exportAs: async (type: 'atom' | 'rss' | 'jsonfeed') => {
			return type;
		},
		toAST: async (): Promise<ASTcomputable> => {
			const c = await compactParse as RespStruct;
			return {
				title: c.title,
				description: c.description ?? '>> no description <<',
				language: c.language ?? 'en-US',
				links: {
					feedUrl: async () => c.feed_url,
					homeUrl: c.home_page_url,
				},
				images: {
					favicon: async () => c.favicon ?? '',
					icon: async () => c.icon ?? '',
					bannerImage: async () => c.icon ?? '',
				},
				paging: {
					nextUrl: async () => '',
					prevUrl: async () => '',
					itemCount: c.items.length,
				},
				authors: Array.isArray(c.authors) && c.authors?.length > 0 ? c.authors : [
					{
						name: c.author?.name ?? '>> no name provided <<',
						url: c.author?.url,
						email: undefined,
						imageURL: c.author?.avatar ??
							`https://randomuser.me/api/portraits/lego/${Math.random() * 9}.jpg`,
					},
				],
				eventStreamFromViewer: {
					tokenData: (Math.random() * 2 ** 128).toString(),
					feedEvents: [
						{
							event: 'read',
							jsonSchemaUrl: '',
							refUrl: '',
							status: {
								name: 'active',
								start: 0,
								end: undefined,
							},
						},
					],
				},
				item: {
					next: async () => [],
					list: c.items.map((i: typeof JsonFeedItem.TYPE) => ({
						id: i.id,
						url: i.url,
						title: i.title,
						summary: i.summary,
						language: i.language ?? 'en-US',

						authors: Array.isArray(i.authors)
							? i.authors.map((a) => ({
								name: a.name,
								email: undefined,
								imageUrl: a.avatar,
								url: a.url,
							}))
							: i.author
							? [{
								name: i.author.name,
								imageUrl: i.author.avatar,
								url: i.author.url,
								email: undefined,
							}]
							: [{ name: '', imageUrl: undefined, url: undefined, email: undefined }],
						content: {
							html: i.content_html,
							makrdown: i.content_makrdown,
							text: i.content_text,
						},
						dates: {
							modified: i.date_modified ? (new Date(i.date_modified)).getTime() : Date.now(),
							published: i.date_published ? (new Date(i.date_published)).getTime() : Date.now(),
						},
						images: {
							bannerImage: async () => '',
							indexImage: async () => '',
						},
						links: {
							category: '',
							externalURLs: [],
							nextPost: '',
							prevPost: '',
						},
						expires: undefined,
						attachments: async () =>
							(i.attachments ?? []).map((a) => {
								return {
									url: a.url,
									title: a.title,
									mimeType: a.mime_type,
									sizeInBytes: a.size_in_bytes,
									durationInSeconds: a.duration_in_seconds,
								};
							}),
					})),
				},
			};
		},
	};
}) as TypedValidator;
