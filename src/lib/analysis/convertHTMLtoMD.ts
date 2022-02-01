import type { AST, UnifiedAttacher } from '../../types.ts';
import { rehypeParse, rehypeRemark, remarkStringify, unified } from '../../mod.ts';

export const applyRehypePlugins = (...rehypePlugins: UnifiedAttacher[]) =>
	async (input: AST): Promise<AST> => {
		const _items = Array.isArray(input.item.list) ? input.item.list : await input.item.list();

		return {
			...input,
			item: {
				next: async () => {
					return [];
				},
				list: await Promise.all(_items.map(async (i) => {
					if (!i.content.html) {
						return i;
					} else {
						return {
							...i,
							content: {
								...i.content,
								markdown: await unified.unified()
									.use(rehypeParse.default)
									.use(rehypeRemark.default)
									.use(rehypePlugins)
									.use(remarkStringify.default)
									.process(
										typeof i.content.html === 'string' ? i.content.html : await i.content.html(),
									),
							},
						};
					}
				})),
			},
		};
	};

export default applyRehypePlugins();
