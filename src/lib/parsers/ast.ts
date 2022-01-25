import { AST, ASTShell, IValidate } from "../../types.ts";
import type { IDictValidPayloadTypes, ISupportedTypes } from "../pickType.ts";
import * as rss from "./rss.ts";
import * as jsonFeed from "./jsonFeed.ts";
import * as sitemap from "./sitemap.ts";
import * as atom from "./atom.ts";

export const validatedInputToAst = async (
  preValidatecdInput: IDictValidPayloadTypes,
): Promise<AST> => {
  switch (preValidatecdInput.kind) {
    case "atom":
      return await atom.Atom(preValidatecdInput.data).toAST();
    case "rss":
      return await rss.Rss(preValidatecdInput.data).toAST();
    case "jsonFeed":
      return await jsonFeed.JsonFeed(preValidatecdInput.data).toAST();
    case "sitemap":
      return await sitemap.Sitemap(preValidatecdInput.data).toAST();
    default:
      return {} as never;
  }
};

const astToShell = async (
  parser: IValidate<ISupportedTypes>,
  ast?: AST,
  pos: { pageBy: number; cur: number } = { pageBy: 50, cur: 0 },
): Promise<ASTShell> => {
  return {
    ast: ast ?? await parser.toAST(),
    parserData: parser._,
    pos: {
      pageBy: 50,
      total: 234,
      cur: 2,
      remaining: 234 - 2,
    },
    next: async () => {
      const { val } = await parser.paginateFrom();
      return astToShell(
        parser,
        await parser.clone(val).toAST(),
        pos,
      );
    },
    prev: async () => {
      const { val } = await parser.prev();
      return astToShell(
        parser,
        await parser.clone(val).toAST(),
        pos,
      );
    },
    use: async (fns) => {
      return fns.reduce(
        async (p, f) => f(await p),
        astToShell(
          parser,
          ast ?? await parser.toAST(),
          pos,
        ),
      );
    },
    toXML: () => {
      return "";
    },
  };
};
