import { StringWriter } from 'https://deno.land/std@0.125.0/io/mod.ts';
// import { copy } from "https://deno.land/std/streams/mod.ts";

export const readToString = async (
	rs: ReadableStream<Uint8Array> | null,
	s = new StringWriter(''),
) => {
	if (!rs) return '';
	else {
		for await (const line of rs) {
			s.write(line);
		}
		return s.toString();
	}
};
export default readToString;

// const unmarshalJSON = async (rs:ReadableStream<Uint8Array> | null) => {
// 	const s = await readToString(rs)
// 	console.log({s})
// 	return JSON.parse(s) as unknown
// }

// const { rss } = await import('../../tests/parsers/mocks/danluu.ts')
// const { jsonFeed } = await import('../../tests/parsers/mocks/flyingmeat.ts')
// console.log({rss, jsonFeed})

// const rssResp = new Response(rss, {headers:{'Contnet-Type':'application/xml+rss'}} )
// const jsonResp = new Response(jsonFeed, {headers:{'Contnet-Type':'application/json' }})

// const encoder = new TextEncoder()
// const rssStr = await readToString(rssResp.body)

// Deno.stdout.write(encoder.encode(jsonFeed))

// console.log(JSON.parse(jsonFeed))

// // const parsedJson = await unmarshalJSON(jsonResp.body)
// console.log({ rssStr})
// console.log({  parsedJson })
