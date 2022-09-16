/**
 * @Problem: To Simplify the reader application - what if the server would
 *              retain the published date of the last read post per feed
 * @Overview: This ffeed filter will use the state per feed, and filter out
 *              older posts.
 * @State: requires one date per feed/path which acts as a a filter showing
 *              things where the date is greater than the filter.
 *
 * @Technical_Issues:
 * - How can the the viewer - notifiy the server uof the read-state per feed?
 * -
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
