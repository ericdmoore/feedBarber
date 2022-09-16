/*
    @Problem: There is web content that may have too much overlap with other content
    @Solution: Score it and sort it - only show scores over threshold value.
*/

import { type ASTChainFunc } from "../index.ts";
import { jsonSchema } from "../../../deps.ts";

export const scoreAsDupplicate = (() => async (ast) => {
  return ast;
}) as ASTChainFunc;
export const paramSchema = { type: jsonSchema.TypeName.Object };
