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
			const type = text ? 'text' : html ? 'html' : markdown ? 'markdown' : null;
			return { type, hash: content ? await cidStr(content) : undefined };
		}));

		// console.log({itemHashes})

		const concatValidHashses = itemHashes.filter((v) => v).join('');

		return {
			...ast,
			_meta: {
				..._meta,
				_type: 'computable',
				source: {
					t: Date.now(),
					url: (await rezVal(ast.links)).sourceURL,
					hash: await cidStr(concatValidHashses),
					from: 'blend',
				},
			},
			item: {
				next: async () => [],
				list: await Promise.all(list.map(async (item, i) => {
					const c = await rezVal(item.content);
					return {
						...item,
						content: {
							...c,
							source: {
								url: item.url,
								t: Date.now(),
								hash: itemHashes[i].hash,
								from: itemHashes[i].type,
							},
						},
					};
				})),
			},
		} as ASTComputable;
	};

const paramSchema = {
	type: 'string',
	nullable: true,
};

export default { f: addHash, param: JSON.stringify(paramSchema) as string };
