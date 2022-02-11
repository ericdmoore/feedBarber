import type { UnifiedAttacher } from '../../types.ts';
import { remarkParse, remarkRetext, retextStringify, unified } from '../../mod.ts';

export const applyRetextPlugins = (
	parseOpts?: unknown,
	bridgeOps?: unknown,
	stringOpts?: unknown,
	cfg: { retextPlugins: UnifiedAttacher[]; remarkPlugins: UnifiedAttacher[] } = {
		retextPlugins: [],
		remarkPlugins: [],
	},
) =>
	async (input: string[]): Promise<string[]> => {
		return Promise.all(input.map(async (s) => {
			return unified.unified()
				.use(remarkParse.default, parseOpts)
				.use(cfg.remarkPlugins)
				.use(remarkRetext.default, bridgeOps)
				.use(cfg.retextPlugins)
				.use(retextStringify.default, stringOpts)
				.process(s);
		}));
	};

export default applyRetextPlugins();
