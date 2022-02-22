import type { ASTComputable, PromiseOr } from '../../types.ts';
import { computableToJson } from '../parsers/ast.ts';
import { cidStr } from '../analysis/calcMultihash.ts';

export const addHash = (_i: never) =>
	async (ast: PromiseOr<ASTComputable>): Promise<ASTComputable> => {
		const a = await computableToJson(ast);

		const itemHashes = await Promise.all(a.items.map(async (i) => {
			const content = i.content.text ?? i.content.markdown ?? i.content.html;
			return content ? await cidStr(content) : undefined;
		}));

		const hashedNullItems = (await Promise.all(itemHashes.map(async (i) => {
			return i ? i : cidStr('null');
		}))).join('');

		return {
			...a,
			_meta: {
				...a._meta,
				_type: 'computable',
				source: {
					...a._meta.source,
					hash: await cidStr(hashedNullItems),
				},
			},
			item: {
				next: async () => [],
				list: a.items.map((item, i) => {
					return { ...item, source: { ...(itemHashes[i] ? { hash: itemHashes[i] } : {}) } };
				}),
			},
		};
	};
