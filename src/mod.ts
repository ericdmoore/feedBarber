// UTILS
export * as path from 'https://deno.land/std@0.125.0/path/mod.ts';

// deno.land/x/
export * as superstruct from 'https://deno.land/x/deno_superstruct@0.0.0/mod.ts';
export * as fromXml from 'https://deno.land/x/xml2js@1.0.0/mod.ts';
export * as toXml from 'https://deno.land/x/js2xml@1.0.2/mod.ts';
export * as DenoDom from 'https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts';
export * as mustache from 'https://deno.land/x/mustache@v0.3.0/mod.ts';

export * as multiformat from 'https://esm.sh/multiformats@9.6.4';
export { default as minhash } from 'https://esm.sh/minhash@v0.0.9';
export { unified } from 'https://denopkg.com/ericdmoore/unified@main/mod.ts';
export { VFile } from 'https://denopkg.com/ericdmoore/vfile@main/mod.ts';

// parse
export { rehypeParse } from 'https://denopkg.com/ericdmoore/rehype@main/packages/rehype-parse/mod.ts';
export { remarkParse } from 'https://denopkg.com/ericdmoore/remark@main/packages/remark-parse/mod.ts';
// export * as retextParse from 'https://esm.sh/retext-english?dts';
// export * as retextEnglish from 'https://esm.sh/retext-english@4?dts'; // 'Parse' is lang specific

// stringify
export { remarkStringify } from 'https://denopkg.com/ericdmoore/remark@main/packages/remark-stringify/mod.ts';
export { rehypeStringify } from 'https://denopkg.com/ericdmoore/rehype@main/packages/rehype-stringify/mod.ts';
// export {default as retextStringify} from 'https://esm.sh/retext-stringify@3.1.0';

// bridges
export { rehypeRemark } from 'https://denopkg.com/ericdmoore/rehype-remark@main/mod.ts';
export { remarkRehype } from 'https://denopkg.com/ericdmoore/remark-rehype@main/mod.ts';
// export * as remarkRetext from 'https://esm.sh/remark-retext?dts';

// RETEXT-middlewares
// export * as retextEmoji from 'https://esm.sh/retext-emoji?dts';
// export * as retextKeywords from 'https://esm.sh/retext-keywords?dts';
// export * as retextSpell from 'https://esm.sh/retext-spell?dts';
// export * as spellingDict from 'https://esm.sh/dictionary-en?dts';
// export * as retextReadability from 'https://esm.sh/retext-readability?dts';

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
