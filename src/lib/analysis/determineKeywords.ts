import type { AST, Node, VFile } from '../../types.ts';
import { remarkParse, remarkRetext, retextKeywords, retextStringify, unified } from '../../mod.ts';

export const applyRetextKeywordss = (
	parseOpts?: unknown,
	bridgeOps?: unknown,
	kwOpts?: unknown,
	stringOpts?: unknown,
) =>
	async (input: AST): Promise<AST> => {
		const _itemList = Array.isArray(input.item.list) ? input.item.list : await input.item.list();

		const vfileFromTextAttr = async (s?: string | (() => Promise<string>)) =>
			!s ? null : await unified.unified()
				.use(remarkParse.default, parseOpts)
				.use(remarkRetext.default, bridgeOps)
				.use(retextKeywords.default, kwOpts)
				.use(retextStringify.default, stringOpts)
				.process(typeof s === 'string' ? s : await s()) as VFile;

		return {
			...input,
			item: {
				...input.item,
				list: await Promise.all(_itemList.map(async (i) => {
					const vf = await vfileFromTextAttr(i.content.text);
					return {
						...i,
						__analysis: {
							keywords: (vf?.data as { keywords: IKeyword[] | undefined })?.keywords,
							keyphrases: (vf?.data as { keyphrase: IKeyPhrase[] | undefined })?.keyphrase,
						},
					};
				})),
			},
		};
	};

export interface IKeyword {
	stem: string;
	score: number;
	matches: {
		node: Node;
		index: number;
		parent: Node;
	}[];
}
export interface IKeyPhrase {
	score: number;
	weight: number;
	stems: string[];
	value: string;
	matches: { parent: Node; nodes: [Node, Node, Node] }[];
}

export default applyRetextKeywordss();
