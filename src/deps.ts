/*
deno cache --lock=lock.json --lock-write src/deps.ts
*/

// deno.land/x/
export * as superstruct from "https://deno.land/x/deno_superstruct@0.0.0/mod.ts";
export * as fromXml from "https://deno.land/x/xml2js@1.0.0/mod.ts";
export * as toXml from "https://deno.land/x/js2xml@1.0.2/mod.ts";
export * as mustache from "https://deno.land/x/mustache@v0.3.0/mod.ts";
export * as jsonSchema from "https://deno.land/x/json_schema_typed@v8.0.0/draft_latest.ts";

// enhancement applications
export * as DenoDom from "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts";
export * as multiformat from "https://esm.sh/multiformats@9.6.4";
export { default as minhash } from "https://esm.sh/minhash@0.0.9";
export { unified } from "https://denopkg.com/ericdmoore/unified@main/mod.ts";
export { VFile } from "https://denopkg.com/ericdmoore/vfile@main/mod.ts";

// parse
export { rehypeParse } from "https://denopkg.com/ericdmoore/rehype@main/packages/rehype-parse/mod.ts";
export { remarkParse } from "https://denopkg.com/ericdmoore/remark@main/packages/remark-parse/mod.ts";
// export * as retextParse from 'https://esm.sh/retext-english?dts';
// export * as retextEnglish from 'https://esm.sh/retext-english@4?dts'; // 'Parse' is lang specific

// stringify
export { remarkStringify } from "https://denopkg.com/ericdmoore/remark@main/packages/remark-stringify/mod.ts";
export { rehypeStringify } from "https://denopkg.com/ericdmoore/rehype@main/packages/rehype-stringify/mod.ts";
// export {default as retextStringify} from 'https://esm.sh/retext-stringify@3.1.0';

// bridges
export { rehypeRemark } from "https://denopkg.com/ericdmoore/rehype-remark@main/mod.ts";
export { remarkRehype } from "https://denopkg.com/ericdmoore/remark-rehype@main/mod.ts";
// export * as remarkRetext from 'https://esm.sh/remark-retext?dts';

// enhancment funciton parsing
export { Buffer as nodeBuffer } from "https://deno.land/std@0.153.0/node/buffer.ts";
export {
  gzipDecode,
  gzipEncode,
} from "https://deno.land/x/wasm_gzip@v1.0.0/mod.ts";
export {
  compress as brCompress,
  decompress as brDecompress,
} from "https://deno.land/x/brotli@v0.1.4/mod.ts";
export {
  compress as zstdCompress,
  decompress as zstdDecompress,
} from "https://deno.land/x/zstd_wasm@0.0.16/deno/zstd.ts";
// export * as jose from 'https://deno.land/x/jose@v4.9.1/index.ts';
export * as bson from "https://deno.land/x/deno_bson@v0.0.2/mod.ts";

export { default as S } from 'https://esm.sh/fluent-json-schema@3.1.0?deno-std=0.153.0"';

// HTML Rendering
export * as sift from "https://deno.land/x/sift@0.6.0/mod.ts";
export {
  Fragment,
  h,
  json,
  jsx,
  serve,
} from "https://deno.land/x/sift@0.6.0/mod.ts";
export * as sheets from "https://esm.sh/twind@0.16.16/sheets";
export * as twind from "https://esm.sh/twind@0.16.16";
export * as twindServer from "https://esm.sh/twind@0.16.17/server";

// CLI
export { parse } from "https://deno.land/std@0.123.0/flags/mod.ts";
export {
  green,
  red,
  yellow,
} from "https://deno.land/x/nanocolors@0.1.12/mod.ts";

// Utils
export { default as WebTorrent } from "https://esm.sh/webtorrent@1.8.30";
export { default as magnetURI } from "https://esm.sh/magnet-uri@6.2.0";
// maybe leverage https://openwebtorrent.com/
export { Buffer } from "https://deno.land/std@0.144.0/io/buffer.ts";
export {
  StringReader,
  StringWriter,
} from "https://deno.land/std@0.144.0/io/mod.ts";
export {
  copy,
  readableStreamFromReader,
  readerFromStreamReader,
} from "https://deno.land/std@0.153.0/streams/conversion.ts";
export * as multi from "https://cdn.skypack.dev/multiformats?dts";
export * as dotenv from "https://deno.land/std@0.153.0/dotenv/mod.ts";
export * as path from "https://deno.land/std@0.153.0/path/mod.ts";

// RETEXT-middlewares
// export * as retextEmoji from 'https://esm.sh/retext-emoji?dts';
// export * as retextKeywords from 'https://esm.sh/retext-keywords?dts';
// export * as retextSpell from 'https://esm.sh/retext-spell?dts';
// export * as spellingDict from 'https://esm.sh/dictionary-en?dts';
// export * as retextReadability from 'https://esm.sh/retext-readability?dts';

// Testing
export * as asserts from "https://deno.land/std@0.153.0/testing/asserts.ts";
export {
  assert,
  assertEquals,
} from "https://deno.land/std@0.153.0/testing/asserts.ts";

// DOTENV
// "https://deno.land/std/dotenv/mod.ts";

interface ABPRuleInit {
  protocol?: string;
  username?: string;
  password?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  baseURL?: string;
  elementBy: {
    allow?: boolean;
    selector?: string;
  };
}
