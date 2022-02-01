import { AST } from '../../types.ts';
import { cheerio } from '../../mod.ts';

const { isArray } = Array;

export const fetchSite = async (url: string | URL) => {
	const _url = typeof url === 'string' ? url : url.toString();
	return (await fetch(_url)).text();
};

export const extractArticleContainer = async (
	url: string | URL,
	cssSelector: string,
) => {
	const $ = cheerio.cheerio.load(await fetchSite(url));
	return $(cssSelector).text();
};

export const apply = (cssSelector: string) =>
	async (input: AST): Promise<AST> => {
		const _items = isArray(input.items) ? input.items : await input.items();

		return {
			...input,
			items: await Promise.all(
				_items.map(async (i) => {
					return {
						...i,
						content: {
							html: typeof i.url === 'string'
								? await extractArticleContainer(i.url, cssSelector)
								: await extractArticleContainer(await i.url(), cssSelector),
						},
					};
				}),
			),
		};
	};

export default apply('#main');
