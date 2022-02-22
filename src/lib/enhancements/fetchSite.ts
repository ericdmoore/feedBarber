import type { AST } from '../../types.ts';
import {rezVal} from '../parsers/ast.ts'
import { join } from "https://deno.land/std@0.125.0/path/mod.ts";
import { DenoDom } from '../../mod.ts';

const { DOMParser } = DenoDom

export const fetchSite = async (url: string | URL) => {
	const _url = typeof url === 'string' ? url : url.toString();
	return (await fetch(_url)).text();
};

const nodeToPath = (initURL:URL) => (n:any) => {
    return (n.attributes?.href ?? '').startsWith('http') 
    ? n.attributes?.href
    : join(initURL.href, n.attributes?.href)
}

export const extractArticleContainer = async (
	inputUrl: string | URL,
	cssSelector: string,
) => {
	const url = typeof inputUrl === 'string' ? new URL(inputUrl) : inputUrl
	const doc = new DOMParser().parseFromString(await fetchSite(url), "text/html")!;
    const articleSections = doc.querySelectorAll(cssSelector);
	const articleText = [...articleSections].map(nodeToPath(url))
	return articleText.join('')
};


export const addFetchedSite = (cssSelector: string) =>
	async (input: AST): Promise<AST> => {
		const _list = await rezVal(input.item.list)
		return {
			...input,
			item: {
				next: async ()=> [],
				list: async () => await Promise.all(
					_list.map(async (i) => {
						return {
							...i,
							content: {
								html: await extractArticleContainer(await rezVal(i.url), cssSelector)
							},
						};
					}),
				),
			}
		};
	};

export default addFetchedSite('#main');
