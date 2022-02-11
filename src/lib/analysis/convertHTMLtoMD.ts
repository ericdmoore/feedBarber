import type { UnifiedAttacher } from '../../types.ts';
import { rehypeParse, rehypeRemark, remarkStringify, unified } from '../../mod.ts';

export const applyRemarkRetextPlugins = (
	parserOPts?: unknown,
	bridgeOpts?: unknown,
	stringifyOpts?: unknown,
	cfg: { rehypePlugins: UnifiedAttacher[]; remarkPlugins: UnifiedAttacher[] } = {
		rehypePlugins: [],
		remarkPlugins: [],
	},
) =>
	async <T extends string | undefined>(
		input: T,
	): Promise<T extends string ? string : undefined> => {
		if (input) {
			const vf = await unified.unified()
				.use(rehypeParse.default, parserOPts)
				.use(cfg.rehypePlugins)
				.use(rehypeRemark.default, bridgeOpts)
				.use(cfg.remarkPlugins)
				.use(remarkStringify.default, stringifyOpts)
				.process(input);
			return vf.toString() as T extends string ? string : undefined;
		} else {
			return undefined as T extends string ? string : undefined;
		}
	};

export default applyRemarkRetextPlugins();
