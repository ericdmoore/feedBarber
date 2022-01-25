import { superstruct, toXml } from "../../mod.ts";
import { IValidate } from "../../types.ts";
import { InnerText } from "./helpers/composedPrimitives.ts";
import er from "./helpers/error.ts";

const { object, type, optional, array, string } = superstruct;

const UrlLoc = object({
  loc: InnerText,
  lastmod: optional(InnerText),
  changefreq: optional(InnerText),
  priority: optional(InnerText),
});

const SitemapLoc = object({
  loc: InnerText,
  lastmod: optional(InnerText),
});

export const SitemapKind = type({
  _declaration: object({
    _attributes: object({
      version: optional(string()),
      encoding: optional(string()),
      standalone: optional(string()),
    }),
  }),
  urlset: optional(object({
    url: array(UrlLoc),
    _attributes: object({
      xmlns: string(),
    }),
  })),
  sitemapindex: optional(object({
    sitemap: array(SitemapLoc),
    _attributes: object({
      xmlns: optional(string()),
    }),
  })),
});

export type RespStruct = typeof SitemapKind.TYPE;

export const Sitemap = (compactParse: unknown): IValidate<RespStruct> => {
  let isValidated = false;
  return {
    _: {} as RespStruct,
    inputKind: "sitemap",
    clone: Sitemap,

    /**
     * Need to expand the sitemapindex versions to a flattened urlLoc version
     */
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

      if (
        (compactParse as RespStruct).urlset ||
        (compactParse as RespStruct).sitemapindex
      ) {
        [err, validated] = SitemapKind.validate(compactParse, {
          coerce: true,
        });

        if (!err && validated) {
          // if sitemapindex
          // expand
          // concat the refs to a flat urlloc version, and re validate

          return Promise.resolve(validated as RespStruct);
        } else if (err) {
          return Promise.reject(
            er(
              compactParse,
              "Sitemap: superstruct validation returned eith errors",
              err.toString(),
            ),
          );
        } else {
          return Promise.reject(
            er(
              compactParse,
              "Sitemap: validation application error",
              new Error().stack,
            ),
          );
        }
      } else {
        return Promise.reject(
          er(
            compactParse,
            `Sitemap: string structure lacks an rss tag within the xml to parse`,
            new Error().stack,
          ),
        );
      }
    },
    paginateFrom: (pos: number = 0, pageBy: number = 50) => {
      return Promise.resolve({
        val: compactParse as RespStruct,
        canPrev: false,
        canNext: false,
      });
    },
    prev: () =>
      Promise.resolve({
        val: compactParse as RespStruct,
        canPrev: false,
        canNext: false,
      }),
    next: () =>
      Promise.resolve({
        val: compactParse as RespStruct,
        canPrev: false,
        canNext: false,
      }),
    toXML: () => toXml.js2xml(compactParse as RespStruct, { compact: true }),
    toAST: () => Promise.resolve({}),
  };
};
export default Sitemap;
