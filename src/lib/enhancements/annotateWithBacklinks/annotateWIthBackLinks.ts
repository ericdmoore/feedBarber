/*
    @premium enhancement?
    @problem: get a feed of who is linking to me?
        @via Pingback?
    @solution: see a feed of who linked to you...

*/

// deno-lint-ignore-file require-await
import { ASTChainFunc } from "../index.ts";
import { jsonSchema } from "../../../deps.ts";
export const addKeywordComparison =
  ((_targetKeywords: string[]) => async (ast) => {
    return ast;
  }) as ASTChainFunc;
export const paramSchema = {
  type: jsonSchema.TypeName.Array,
  items: jsonSchema.TypeName.String,
};
