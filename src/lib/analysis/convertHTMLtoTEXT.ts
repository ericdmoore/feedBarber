import type { AST, UnifiedAttacher } from '../../types.ts';
import { 
	remarkParse, 
	remarkRetext, 
	retextStringify, 
	unified,
	
} from '../../mod.ts';

// import unified from "https://denopkg.com/unifiedjs/unified@10.1.1/index.d.ts"
// import rehypeParse from "https://denopkg.com/rehypejs/rehype@rehype-parse%408.0.4/packages/rehype-parse/index.d.ts"


export const applyRetextPlugins = (parseOpts?:unknown, bridgeOps?:unknown, stringOpts?:unknown, ...rehypePlugins: UnifiedAttacher[]) =>
	async (input: AST): Promise<AST> => {
		const _items = Array.isArray(input.item.list) ? input.item.list : await input.item.list();

		return {
			...input,
			item: {
				...input.item,
				list: await Promise.all(_items.map(async (i) => {
					return !i.content.markdown 
					? i
					: {
						...i,
						content: {
							...i.content,
							text: await unified.unified()
								.use(remarkParse.default, parseOpts)
								.use(remarkRetext.default, bridgeOps)
								.use(rehypePlugins)
								.use(retextStringify.default, stringOpts)
								.process(
									typeof i.content.markdown === 'string' 
										? i.content.markdown 
										: await i.content.markdown(),
								),
							},
						};
					
				})),
			},
		};
	};

	export default applyRetextPlugins();