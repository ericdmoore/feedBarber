import type { ASTComputable, PromiseOr } from '../../types.ts';
import { rezVal } from '../parsers/ast.ts';
import { cidStr } from '../analysis/calcMultihash.ts';

export const addHash = (_i?: unknown) =>
	async (ast: PromiseOr<ASTComputable>): Promise<ASTComputable> => {
		ast = await ast as ASTComputable;
		const _meta = await rezVal(ast._meta);
		const list = await rezVal(ast.item.list);

		const itemHashes = await Promise.all(list.map(async (i) => {
			const { html, text, markdown } = await rezVal(i.content);
			const content = text ?? markdown ?? html;
			return content ? await cidStr(content) : undefined;
		}));

		const hashedNullItems = itemHashes.filter((v) => v).join('');

		return {
			...ast,
			_meta: {
				..._meta,
				_type: 'computable',
				source: {
					..._meta.source,
					hash: await cidStr(hashedNullItems),
				},
			},
			item: {
				next: async () => [],
				list: list.map((item, i) => {
					return { ...item, source: { ...(itemHashes[i] ? { hash: itemHashes[i] } : {}) } };
				}),
			},
		};
	};
