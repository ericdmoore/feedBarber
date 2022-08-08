import { ASTComputable, PromiseOr } from '../../types.ts';
import { rezVal } from '../parsers/ast.ts';
import { join } from 'https://deno.land/std@0.125.0/path/mod.ts';
import { DOMParser, Node } from 'https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts';

const nodeToPath = (initURL: string) => (n: Node & { attributes?: { href: string } }) => {
	return n.attributes?.href
		? n.attributes?.href.startsWith('http') ? n.attributes?.href : join(initURL, n.attributes?.href)
		: initURL;
};

const loadPage = async (url: string): Promise<string> => await (await fetch(url)).text();

const maybeHead = <T>(i: T[]) => i.length > 0 ? i[0] : undefined;

const loadUrlAndPluckCssPath = async (
	url: string,
	rawBodyIfAvail: PromiseOr<string | undefined>,
	css: { nextPost: string; prevPost: string },
): Promise<{ nextPost?: string; prevPost?: string; raw?: string }> => {
	const raw = await rawBodyIfAvail ?? await loadPage(url);
	const doc = new DOMParser().parseFromString(raw, 'text/html')!;
	const nextPostNodes = doc.querySelectorAll(css.nextPost);
	const prevPostNodes = doc.querySelectorAll(css.prevPost);

	const toPath = nodeToPath(url);
	return {
		nextPost: maybeHead([...nextPostNodes].map(toPath)),
		prevPost: maybeHead([...prevPostNodes].map(toPath)),
		raw,
	};
};

export const addPostLinks =
	(input: { nextPost: string; prevPost: string }) => async (_ast: PromiseOr<ASTComputable>): Promise<ASTComputable> => {
		const ast = await _ast;
		input.nextPost = atob(input.nextPost);
		input.prevPost = atob(input.prevPost);
		return {
			...ast,
			item: {
				...ast.item,
				list: async () => {
					const list = await rezVal(ast.item.list);
					return Promise.all(list.map(async (i) => {
						const c = await rezVal(i.content);
						const l = await rezVal(i.links);

						const { raw, nextPost, prevPost } = await loadUrlAndPluckCssPath(await rezVal(i.url), c.raw, input);

						return {
							...i,
							content: { ...c, raw },
							links: { ...l, nextPost, prevPost },
						};
					}));
				},
			},
		};
	};

const paramSchema = {
	type: 'object',
	properties: {
		nextPost: { type: 'string', contentEncoding: 'base64' },
		prevPost: { type: 'string', contentEncoding: 'base64' },
	},
	required: ['prevPost', 'nextPost'],
	additionalProperties: false,
};

export default { f: addPostLinks, param: JSON.stringify(paramSchema) };
