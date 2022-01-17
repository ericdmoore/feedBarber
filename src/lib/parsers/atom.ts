// define the expected atom shape
// perform the fetch
// validate the response

import { superstruct, xml } from "../../mod.ts";

// deno-lint-ignore no-unused-vars
import { Dict, maybe } from "./helpers/maybe.ts";

// define
const { is, union, number, object, string, array, literal, optional } =
  superstruct;

const PersonKind = object({
  name: string(),
  uri: maybe(string()),
  email: maybe(string()),
});

const TypedInnerText = object({
  _attributes: optional(object({
    type: literal("text"),
  })),
  _text: string(),
});

const Title  = TypedInnerText
const Subitle = TypedInnerText

const InnerText = object({ _text: string() });
const ID = InnerText;
const Updated = InnerText;

const Author = object({
  name: object({
    _text: string(),
  }),
  uri: object({
    _text: string(),
  }),
});

const Link = object({
  _attributes: object({
    rel: string(),
    type: string(),
    href: string(),
  }),
});

const Content = object({
  _attributes: object({
    type: literal('html'),
    "xml:base": optional(string())
  }),
  _cdata: string()
})

const Summary = Content

const LinkSet = array(Link);

const LinkOrLinkSet = union([Link, LinkSet]);

const MaybePersonOrSting = maybe(union([string(), PersonKind]));

const EntryKind = object({
  id: ID,
  title: Title,
  published: string(),
  link: LinkOrLinkSet,
  updated: maybe(Updated),
  author: maybe(Author),
  summary: maybe(Summary),
  content: maybe(Content),
  // name: maybe(string()),
  // email: maybe(string()),
  // uri: maybe(string()),
});

const AtomKind = object({
  id: ID,
  title: Title,
  updated: InnerText,
  link: LinkOrLinkSet,
  //
  generator: maybe(string()),
  icon: maybe(string()),
  logo: maybe(string()),
  subtitle: maybe(string()),
  author: MaybePersonOrSting,
  contributor: MaybePersonOrSting,
  category: maybe(array(string())),
  rights: maybe(string()),
  //
  entry: array(EntryKind),
});


type ParserReturn<T> = ParserReturnClean<T> | ParserReturnWithErr<T>
type ParserReturnClean<T> = [null, T]
type ParserReturnWithErr<T> = [superstruct.StructError, T | null]

export const Atom = () => {

  let compactParse = {} as typeof AtomKind.TYPE;

  return {
    structs: {
      parsed: AtomKind,
    },
    isType: {
      parsed: (input: string) => is(input, Atom().structs.parsed),
    },
    validate: (input: string | unknown ): ParserReturn<typeof AtomKind.TYPE> =>{
      let data: null | typeof AtomKind.TYPE = null

      if(typeof input ==='string'){
        data = Atom().parse(input) as typeof AtomKind.TYPE
      }else{
        data = input as typeof AtomKind.TYPE
      }

      const [err, validated] = Atom().structs.parsed.validate(data)
      
      if(err) {
          return [err, validated] as [null, typeof AtomKind.TYPE]
        } else {
          return [null, validated] as [null, typeof AtomKind.TYPE]
      }
    },
    parse: (s: string): typeof AtomKind.TYPE => {
      return xml.xml2js(s, {compact: true}) as unknown as typeof AtomKind.TYPE;
    },
  };
};
