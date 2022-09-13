import { type EnhancementModule } from "./index.ts";
import type { ASTComputable, PromiseOr } from "../../types.ts";
import { superstruct as s } from "../../mod.ts";
import { computableToJson, jsonToComputable } from "../parsers/ast.ts";
import { JsonValue, setPath as setter } from "../utils/propertyPath.ts";
import { mustache } from "../../mod.ts";
import { setPathSchema } from "../schemas/setPath.ts";
import er from "../parsers/helpers/error.ts";

const { object, string } = s;

export const SetPathParams = object({
  path: string(),
  value: string(),
});

const discoverValueType = (
  s: string,
): { type: "json" | "mustache" | "error"; str: string } => {
  if (s.toLowerCase().startsWith("json::")) {
    return { type: "json", str: s.slice("json::".length) };
  } else if (s.toLowerCase().startsWith("{{::")) {
    return { type: "mustache", str: s.slice("{{::".length) };
  } else {
    return { type: "error", str: "" };
  }
};

/**
 * ## Set Path
 * Use a jsonPath to set existing values within a JSON value.
 * @param input
 * @param input.path  - a jsonPath that identifies a valid AST attribute - default: 'title'
 * @param input.value - a stringified JSON value - default: 'Hello World'
 */
export const setPath = (
  input: s.Infer<typeof SetPathParams> = {
    path: "title",
    value: 'json::"Title: Hello World!"',
  },
) =>
async (_ast: PromiseOr<ASTComputable>): Promise<ASTComputable> => {
  if (!SetPathParams.is(input)) {
    return Promise.reject(er(input, "", new Error().stack));
  }
  try {
    const { type, str } = discoverValueType(input.value);

    const ast = await computableToJson(await _ast);
    let replacerVal: JsonValue;
    let mustacheRender: string;

    switch (type) {
      case "json":
        replacerVal = JSON.parse(str) as JsonValue;
        break;
      case "mustache":
        mustacheRender = mustache.render(
          str,
          ast as Record<string, unknown>,
        ) as string;
        replacerVal = JSON.parse(mustacheRender) as string;
        break;
      default:
        replacerVal = JSON.parse(str) as JsonValue;
    }
    setter(input.path, replacerVal, ast as JsonValue);
    return jsonToComputable(ast);
  } catch (e) {
    return Promise.reject(
      er({ input }, `JSON.parse error on input \n ${e}`, new Error().stack),
    );
  }
};

export default {
  run: setPath,
  params: {
    run: JSON.stringify(setPathSchema),
  },
} as EnhancementModule;
