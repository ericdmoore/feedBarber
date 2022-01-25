import { fromXml } from "../mod.ts";
import { atom, jsonfeed, rss, sitemap } from "./parsers/index.ts";

export type ISupportedTypeNames =
  | "atom"
  | "jsonFeed"
  | "jsonLD"
  | "sitemap"
  | "rss"
  | "JS_SELECTION_ERROR"
  | "TEXT_SELECTION_ERROR";

export type ISupportedTypes =
  | atom.RespStruct
  | jsonfeed.RespStruct
  | rss.RespStruct
  | sitemap.RespStruct;

export type IDictUnionOfPayloadTypes =
  | { kind: "atom"; data: typeof atom.AtomResponse.TYPE }
  | { kind: "jsonFeed"; data: typeof jsonfeed.JsonFeedKind.TYPE }
  | { kind: "jsonLD"; data: typeof jsonfeed.JsonFeedKind.TYPE }
  | { kind: "rss"; data: typeof rss.RssResponse.TYPE }
  | { kind: "sitemap"; data: typeof sitemap.SitemapKind.TYPE }
  | { kind: "JS_SELECTION_ERROR"; data: Error }
  | { kind: "TEXT_SELECTION_ERROR"; data: Error };

export type IDictValidPayloadTypes = Exclude<
  IDictUnionOfPayloadTypes,
  { kind: "JS_SELECTION_ERROR" } | { kind: "TEXT_SELECTION_ERROR" }
>;

export const parseAndPickType = (
  responseText: string,
): IDictUnionOfPayloadTypes => {
  try {
    const jsO = JSON.parse(responseText);
    if ("items" in jsO) {
      return {
        kind: "jsonFeed",
        data: jsO as typeof jsonfeed.JsonFeedKind.TYPE,
      };
    } else {
      return { 
        kind: "JS_SELECTION_ERROR", 
        data: new Error() 
      };
    }
  } catch (_) {
    const jsO = fromXml.xml2js(responseText, { compact: true });
    console.log({jsO})
    if (jsO?.feed) {
      return { kind: "atom", data: jsO as typeof atom.AtomResponse.TYPE };
    } else if (jsO?.rss) {
      return { kind: "rss", data: jsO as typeof rss.RssResponse.TYPE };
    } else if (jsO?.urlset || jsO?.sitemapindex) {
      return { kind: "sitemap", data: jsO as typeof sitemap.SitemapKind.TYPE };
    } else {
      return { kind: "TEXT_SELECTION_ERROR", data: new Error() };
    }
  }
};

export const typedValidation = async (
  input: IDictUnionOfPayloadTypes,
): Promise<IDictValidPayloadTypes> => {
  switch (input.kind) {
    case "rss":
      return { kind: "rss", data: await rss.Rss(input.data).validate() };
    case "atom":
      return { kind: "atom", data: await atom.Atom(input.data).validate() };
    case "jsonFeed":
      return { kind: "jsonFeed", data: await jsonfeed.JsonFeed(input.data).validate() };
    case "sitemap":
      return {
        kind: "sitemap",
        data: await sitemap.Sitemap(input.data).validate(),
      };
    default:
      return {} as never;
  }
};

export default parseAndPickType;
