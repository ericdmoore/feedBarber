import { ASTComputable } from '../../types.ts';
import { superstruct as s } from '../../mod.ts';
import { computableToJson, jsonToComputable } from '../parsers/ast.ts';
import er from '../parsers/helpers/error.ts';
import { JsonValue, setPath as setter } from '../utils/propertyPath.ts';

const { object, string } = s;

export const SetPathParams = object({
	path: string(),
	value: string(),
});

export const setPath = (
	input: s.Infer<typeof SetPathParams> = { path: 'title', value: 'Hello World Title!' },
) =>
	async (_ast: Promise<ASTComputable>): Promise<ASTComputable> => {
		try {
			const replacerVal = JSON.parse(input.value) as JsonValue;
			if (!SetPathParams.is(input)) {
				return Promise.reject(er(input, '', new Error().stack));
			} else {
				const ast = await computableToJson(await _ast);
				setter(input.path, replacerVal, ast as JsonValue);
				return jsonToComputable(ast);
			}
		} catch (e) {
			return Promise.reject(er({ input }, `JSON.parse error on input \n ${e}`, new Error().stack));
		}
	};
