// define the expected atom shape
// perform the fetch
// validate the response

import { superstruct, toXml } from "../../mod.ts";
import { AST, IValidate } from "../../types.ts";
import er from "./helpers/error.ts";
import {
  Enclosure,
  Generator,
  GUID,
  InnerText,
  Link,
  OptInnerText,
  TypedInnerText,
} from "./helpers/composedPrimitives.ts";

// number, is
const { union, is, define, partial, object, string, array, literal, optional } =
  superstruct;

export const RssItem = object({
  title: InnerText,
  link: InnerText,
  guid: GUID,
  comments: optional(InnerText),
  "dc:creator": optional(TypedInnerText),
  pubDate: optional(InnerText),
  category: optional(TypedInnerText),
  description: TypedInnerText,
  "content:encoded": optional(TypedInnerText),
  "wfw:commentRss": optional(InnerText),
  "slash:comments": optional(InnerText),
  enclosure: optional(union([Enclosure, array(Enclosure)])),
});

export const RssResponse = object({
  _declaration: object({
    _attributes: object({
      version: optional(string()),
      encoding: optional(string()),
      standalone: optional(string()),
    }),
  }),
  rss: object({
    _attributes: object({
      version: optional(string()),
      "xmlns:atom": optional(string()),
      "xmlns:content": optional(string()),
      "xmlns:wfw": optional(string()),
      "xmlns:dc": optional(string()),
      "xmlns:sy": optional(string()),
      "xmlns:slash": optional(string()),
      "xmlns:georss": optional(string()),
      "xmlns:geo": optional(string()),
    }),
    channel: object({
      title: InnerText,
      link: InnerText,
      description: optional(OptInnerText),
      generator: optional(Generator),
      language: optional(OptInnerText),
      lastBuildDate: optional(OptInnerText),
      "atom:link": optional(Link),
      "sy:updatePeriod": optional(OptInnerText),
      "sy:updateFrequency": optional(OptInnerText),
      item: array(RssItem),
    }),
  }),
});

export type RespStruct = typeof RssResponse.TYPE;

export const Rss = (
  compactParse: RespStruct | unknown,
): IValidate<RespStruct> => {
  const structs = {
    response: RssResponse,
    item: RssItem,
  };
  return {
    inputKind: "rss",
    validate: (): Promise<RespStruct> => {
      let err: superstruct.StructError | undefined;
      let validated: unknown;

      if (typeof compactParse === "string") {
        return Promise.reject(er(compactParse, "", new Error().stack));
      }
      if (compactParse == null) {
        return Promise.reject(
          er(compactParse, "got a null", new Error().stack),
        );
      }

      if ((compactParse as RespStruct).rss) {
        [err, validated] = structs.response.validate(compactParse, {
          coerce: true,
        });

        if (validated && !err) {
          return Promise.resolve(validated as RespStruct);
        } else if (err) {
          return Promise.reject(
            er(
              compactParse,
              "RSS: validation application error",
              err.toString(),
            ),
          );
        } else {
          return Promise.reject(
            er(
              compactParse,
              "RSS: validation application error",
              new Error().stack,
            ),
          );
        }
      } else {
        return Promise.reject(
          er(
            compactParse,
            `RSS: string structure lacks an rss tag within the xml to parse`,
            new Error().stack,
          ),
        );
      }
    },
    clone: Rss,
    _: compactParse as RespStruct,
    paginateFrom: (pos: number = 0, pageBy: number = 50) => {
      return Promise.resolve({
        val: compactParse as RespStruct,
        canPrev: false,
        canNext: false,
      });
    },
    next: () => {
      return Promise.resolve({
        val: compactParse as RespStruct,
        canNext: false,
        canPrev: false,
      });
      // does it support next/prev?
    },
    prev: () => {
      return Promise.resolve({
        val: compactParse as RespStruct,
        canNext: false,
        canPrev: false,
      });
    },
    toXML: (): string => {
      return toXml.js2xml(compactParse as RespStruct, { compact: true });
    },
    toAST: () => Promise.resolve({} as AST),
  };
};
