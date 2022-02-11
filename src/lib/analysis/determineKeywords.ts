import type { Node, VFile } from '../../types.ts';
import { remarkParse, remarkRetext, retextKeywords, retextStringify, unified } from '../../mod.ts';

export const determineKeywords = (
	parseOpts?: unknown,
	bridgeOps?: unknown,
	kwOpts?: unknown,
	stringOpts?: unknown,
) =>
	/**
	 * @param input expdeects a text or markdown?
	 * @returns
	 */
	async (input?: string | (() => Promise<string>)) => {
		if (!input) {
			return {
				input: undefined,
				bodyTextVersion: undefined,
				keywords: undefined,
				keyphrases: undefined,
			};
		}
		const vfileWithKW = async (s: string | (() => Promise<string>)) => {
			const vf = await unified.unified()
				.use(remarkParse.default, parseOpts)
				.use(remarkRetext.default, bridgeOps)
				.use(retextKeywords.default, kwOpts)
				.use(retextStringify.default, stringOpts)
				.process(typeof s === 'string' ? s : await s()) as VFile;
			return vf;
		};

		const vf = await vfileWithKW(input);
		const d = vf.data as { keywords?: IKeyword[]; keyphrases?: IKeyPhrase[] } | undefined;

		return {
			input,
			bodyTextVersion: vf.toString(),
			keywords: d?.keywords,
			keyphrases: d?.keyphrases,
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

export default determineKeywords();
