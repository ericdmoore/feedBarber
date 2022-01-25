import { superstruct } from "../../../mod.ts";
const { partial, optional, object, string, union, literal, define, is } = superstruct;

export type TextOrHTMLUnion =
  | "text"
  | "text/html"
  | "html";

export const TextOrHTML = define<TextOrHTMLUnion>(
  "TextOrHTML",
  (s: unknown) =>
    is(
      (s as string).toLowerCase(),
      union([
        literal("text"),
        literal("text/html"),
        literal("html"),
      ]),
    ),
);

export const InnerText = object({ _text: string() });
export const OptInnerText = object({ _text: optional(string()) });

export const GUID = partial(object({
  _text: string(),
  _attributes: object({ 
    isPermaLink: optional(string())
  })
}))

export const Enclosure = object({
  _attributes: object({
    url: string(),
    type: optional(string()),
    length: optional(string())
  })
})

export const Link = object({
  _attributes: object({
    href: string(),
    rel: optional(string()),
    type: optional(string()),
  })
})

export const TypedInnerText = partial(
  object({
    _attributes: object({
      type: optional(TextOrHTML),
    }),
    _text: string(),
    _cdata: string(),
  })
);

export const LinkedVersionedTextOrCData = partial(object({
  _attributes: partial(object({
    uri: string(),
    version: string(),
  })),
  _text: string(),
  _cdata: string(),
}));


export const Generator = LinkedVersionedTextOrCData