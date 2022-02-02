import type { ASTcomputable } from './ast.ts';
import type { ISupportedTypes, TypedValidator } from '../pickType.ts';
import { superstruct, toXml } from '../../mod.ts';
import { IValidate } from '../../types.ts';
import { InnerText } from './helpers/composedPrimitives.ts';
import { IDictUnionOfPayloadTypes, parseAndPickType } from '../pickType.ts';
import er from './helpers/error.ts';

const { object, type, optional, array, string } = superstruct;

const UrlLoc = object({
	loc: InnerText,
	lastmod: optional(InnerText),
	changefreq: optional(InnerText),
	priority: optional(InnerText),
});
type IUrlLoc = typeof UrlLoc.TYPE;

const SitemapLoc = object({
	loc: InnerText,
	lastmod: optional(InnerText),
});

type ISitemapLoc = typeof SitemapLoc.TYPE;

const UrlSet = object({
	url: array(UrlLoc),
	_attributes: optional(object({
		xmlns: string(),
	})),
});

const IndexSet = object({
	sitemap: array(SitemapLoc),
	_attributes: optional(object({
		xmlns: optional(string()),
	})),
});

export const SitemapKind = type({
	_declaration: object({
		_attributes: object({
			version: optional(string()),
			encoding: optional(string()),
			standalone: optional(string()),
		}),
	}),
	urlset: optional(UrlSet),
	sitemapindex: optional(IndexSet),
});

export type RespStruct = typeof SitemapKind.TYPE;

export const expand = async (compactParse: RespStruct): Promise<RespStruct> => {
	const allFetchedExternals = await Promise.all(
		(compactParse?.sitemapindex?.sitemap ?? []).map(
			async (sm) =>
				parseAndPickType(
					await (await fetch(sm.loc._text)).text(),
				),
		),
	);

	const newSitemapResp = allFetchedExternals.filter((res) => res.kind === 'sitemap') as Extract<
		IDictUnionOfPayloadTypes,
		{ kind: 'sitemap' }
	>[];

	const newSitemaps: ISitemapLoc[] = newSitemapResp
		.filter((sm) => !!sm.data.sitemapindex?.sitemap)
		.reduce((p, sm) => {
			return [
				...p,
				...(sm.data.sitemapindex?.sitemap ?? []),
			] as ISitemapLoc[];
		}, [] as ISitemapLoc[]) as ISitemapLoc[];

	const newUrls: IUrlLoc[] = newSitemapResp
		.filter((sm) => !!sm.data.urlset?.url)
		.reduce((p: IUrlLoc[], sm) => {
			return [
				...p,
				...(sm.data.urlset?.url ?? []),
			] as IUrlLoc[];
		}, [] as IUrlLoc[]) as IUrlLoc[];

	const recurseParam = {
		...compactParse,
		sitemapindex: {
			...compactParse.sitemapindex,
			sitemap: newSitemaps ?? [],
		},
	} as RespStruct;

	return {
		...compactParse,
		urlset: {
			...compactParse.urlset,
			url: (compactParse?.urlset?.url ?? [])
				.concat(newUrls)
				.concat((await expand(recurseParam)).urlset?.url ?? []) as IUrlLoc[],
		},
	};
};

export const Sitemap: TypedValidator = (
	compactParse: unknown | RespStruct,
): IValidate<RespStruct> => {
	let isValidated = false;
	return {
		_: {} as RespStruct,
		inputKind: 'sitemap',
		clone: Sitemap,

		/**
		 * Need to expand the sitemapindex versions to a flattened urlLoc version
		 */
		validate: async (): Promise<RespStruct> => {
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

			if (
				(compactParse as RespStruct).urlset ||
				(compactParse as RespStruct).sitemapindex
			) {
				[err, validated] = SitemapKind.validate(compactParse, {
					coerce: true,
				});

				if (!err && validated) {
					let v = validated as RespStruct;
					if (v.sitemapindex?.sitemap) {
						v = await expand(v);
					}

					[err, validated] = SitemapKind.validate(v, { coerce: true });

					if (validated) {
						return Promise.resolve(validated as RespStruct);
					} else if (err) {
						return Promise.reject(
							er(
								v,
								'Sitemap Expansion: superstruct validation returned eith errors',
								err.toString(),
							),
						);
					} else {
						return Promise.reject(
							er(
								v,
								'Sitemap Expansion: superstruct validation returned eith errors',
								new Error().stack,
							),
						);
					}
				} else if (err) {
					return Promise.reject(
						er(
							compactParse,
							'Sitemap: superstruct validation returned eith errors',
							err.toString(),
						),
					);
				} else {
					return Promise.reject(
						er(
							compactParse,
							'Sitemap: validation application error',
							new Error().stack,
						),
					);
				}
			} else {
				return Promise.reject(
					er(
						compactParse,
						`Sitemap: string structure lacks an rss tag within the xml to parse`,
						new Error().stack,
					),
				);
			}
		},
		paginateFrom: (pos: number = 0, pageBy: number = 50) => {
			return Promise.resolve({
				val: compactParse as RespStruct,
				canPrev: false,
				canNext: false,
			});
		},
		prev: () =>
			Promise.resolve({
				val: compactParse as RespStruct,
				canPrev: false,
				canNext: false,
			}),
		next: () =>
			Promise.resolve({
				val: compactParse as RespStruct,
				canPrev: false,
				canNext: false,
			}),
		toXML: () => toXml.js2xml(compactParse as RespStruct, { compact: true }),
		// fromAST : (inmput: ASTcomputable | ASTjson ):Promise<RespStruct>=> {},
		toAST: async (): Promise<ASTcomputable> => {
			const c = compactParse as RespStruct;
			return {
				title: 'feed from ...',
				description: 'this feed is generated from a sitemap',
				language: 'en-US',

				links: {
					homeUrl: '',
					feedUrl: '',
				},
				images: {
					icon: '',
					favicon: '',
					bannerImage: '',
				},
				paging: {
					nextUrl: '',
					prevUrl: '',
					itemCount: 0,
				},
				authors: async () => {
					return [{ name: '' }];
				},
				_sitemap: {},
				item: {
					next: async () => [],
					list: (c.urlset?.url ?? []).map((u) => {
						return {
							id: u.loc._text,
							url: u.loc._text,
							language: 'en-US',

							title: async () => '',
							summary: async () => '',
							authors: async () => {
								return [{ name: '' }];
							},

							content: {
								html: async () => '',
								makrdown: async () => '',
								text: async () => '',
							},
							dates: {
								published: async () => -1,
								modified: async () => -1,
							},

							images: {
								bannerImage: async () => '',
								indexImage: async () => '',
							},

							links: {
								nextPost: async () => '',
								prevPost: async () => '',
								category: async () => '',
								tags: async () => [''],
								externalURLs: async () => [''],
							},
							attachments: async () => {
								return [{ url: '', mimeType: '' }];
							},
							expires: undefined,
							_sitemap: {},
						};
					}),
				},
			};
		},
	};
};
export default Sitemap;
