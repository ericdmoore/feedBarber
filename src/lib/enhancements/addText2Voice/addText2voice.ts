/**
 * Using AWS Transcribe:
 * https://us-east-1.console.aws.amazon.com/transcribe/home?region=us-east-1#welcome
 */

// deno-lint-ignore-file require-await
import { ASTChainFunc } from "../index.ts";
import { jsonSchema } from "../../../deps.ts";
export const addTextToVoice = ((_targetKeywords: string[]) => async (ast) => {
  return ast;
}) as ASTChainFunc;
export const paramSchema = {
  type: jsonSchema.TypeName.Array,
  items: jsonSchema.TypeName.String,
};
