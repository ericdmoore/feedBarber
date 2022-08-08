// whatabout pupeteer?
// https://deno.land/x/puppeteer@14.1.1

import { ASTComputable, PromiseOr } from '../../types.ts';
import { rezVal } from '../parsers/ast.ts';
import { DenoDom } from '../../mod.ts';
const { DOMParser } = DenoDom;

const loadPage = async (url: string) => (await fetch(url)).text();

const pickArticle = async (raw: string, css: string): Promise<string | undefined> => {
	const doc = new DOMParser().parseFromString(raw, 'text/html')!;
	const articleNode = doc.querySelector(css);
	return articleNode?.outerHTML;
};

export const addLoadRawAndArticle =
	(input: { articleCss: string }) => async (ast_: PromiseOr<ASTComputable>): Promise<ASTComputable> => {
		input.articleCss = atob(input.articleCss);
		const ast = await ast_;
		return {
			...ast,
			item: {
				...ast.item,
				list: async () => {
					const list = await rezVal(ast.item.list);
					return Promise.all(list.map(async (i) => {
						const content = await rezVal(i.content);
						const raw = content.raw ?? await loadPage(await rezVal(i.url));
						const article = await pickArticle(raw, input.articleCss);
						return {
							...i,
							content: {
								...content,
								raw,
								article,
							},
						};
					}));
				},
			},
		};
	};

const paramSchema = {
	type: 'object',
	properties: {
		articleCss: { type: 'string', contentEncoding: 'base64' },
	},
	required: ['articleCss'],
	additionalProperties: false,
};

export default { f: addLoadRawAndArticle, param: JSON.stringify(paramSchema) as string };
