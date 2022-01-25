// define the expected atom shape
// perform the fetch
// validate the response

import type { AST, IValidate } from "../../types.ts";

import { superstruct, toXml } from "../../mod.ts";
import er from "./helpers/error.ts";

const { number, union, literal, optional, type, object, string, array, boolean, record } = superstruct;
// define, union

export const JsonFeedAuthor = type({
  name:string(),
  url:optional(string()),
  avatar:optional(string())
})

export const JsonAttachments = type({
  url: string(),
  mime_type: string(),
  title: optional(string()),
  size_in_bytes: optional(number()),
  duration_in_seconds: optional(number()),
})

export const JsonFeedItem = type({
  id: string(), // can also be the permalink
  url: string(),// permalink
  external_url: optional(string()), // 
  title: optional(string()),
  content_html: optional(string()),
  content_text: optional(string()),
  content_makrdown: optional(string()),
  summary: optional(string()),
  image: optional(string()),
  banner_image: optional(string()), // layout above the post
  date_published: optional(string()), // ISO fmt
  date_modified: optional(string()), // ISO fmt
  language: optional(string()),
  tags: optional(array(string())),
  author: optional(JsonFeedAuthor),
  authors: optional(array(JsonFeedAuthor)),
  attachments: optional(array(JsonAttachments)),
  _eventStreamFromViewer: optional(object({
    tokenData: string(),
    feedEvents: object({
      available: array(string()),
      defaultUrl: string(),
    }),
    events: record(
      union([ 
        literal('read'), 
        literal('share')
      ]),
      object({
        ts: number(),
        feedUri: string(),
        postUri: string(),
      })
    )
  }))
});

export const JsonFeedKind = type({
  version: string(),
  title: string(),
  home_page_url: string(),
  feed_url: string(), // import meta.url
  items: array(JsonFeedItem),
  author: optional(JsonFeedAuthor),
  authors: optional(array(JsonFeedAuthor)),
  description:optional(string()), // of feed 
  user_comment:optional(string()), // developer comment
  next_url:optional(string()), // 
  icon:optional(string()), // 
  favicon:optional(string()),
  language:optional(string()),
  expired:optional(boolean()),
  hubs:optional(array(object({
    type: string(), 
    url: string() 
  }))),
});

export type RespStruct = typeof JsonFeedKind.TYPE;

export const JsonFeed = (
  compactParse: RespStruct | unknown,
): IValidate<RespStruct> => {
  const structs = {
    response: JsonFeedKind,
  };

  return {
    inputKind: "jsonFeed",
    validate: (): Promise<RespStruct> => {
      let err: superstruct.StructError | undefined;
      let validated: unknown;

      if (typeof compactParse === "string") {
        return Promise.reject(er(compactParse, "JsonFeed: must passe the string before validation", new Error().stack));
      }
      if (compactParse == null) {
        return Promise.reject(
          er(
            compactParse, 
            "JsonFeed: found null input", 
            new Error().stack
          ),
        );
      }

      if ("items" in (compactParse as RespStruct)) {
        [err, validated] = structs.response.validate(compactParse, {
          coerce: true,
        });

        if (validated && !err) {
          return Promise.resolve(validated as RespStruct);
        } else if (err ) {
          return Promise.reject(
            er(
              compactParse, 
              "JsonFeed: validation application error", 
               err.toString()
            ),
          );
        } else {
          return Promise.reject(
            er(
              compactParse, 
              "JsonFeed: validation application error", 
              new Error().stack
            ),
          );
        }
      } else {
        return Promise.reject(
          er(
            compactParse,
            "string structure lacks a `feed` tag within the parsed payload",
            new Error().stack,
          ),
        );
      }
    },
    clone: JsonFeed,
    _: compactParse as RespStruct,
    /**
     * @param pos - starting positi0on
     * @param pageBy - intteger value (pos|neg) indicating the page size and direction from the starting position
     * @returns
     */
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
        canPrev: false,
        canNext: false,
      });
    },
    prev: () => {
      return Promise.resolve({
        val: compactParse as RespStruct,
        canPrev: false,
        canNext: false,
      });
    },
    toXML: () => {
      return toXml.js2xml(compactParse as RespStruct, { compact: true });
    },
    toAST: () => Promise.resolve({} as AST),
  };
};
