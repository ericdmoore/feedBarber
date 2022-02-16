import { json } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import type { ASTJson } from '../../types.ts';
import { computableToJson } from '../../lib/parsers/ast.ts';
import { atom, jsonfeed, rss } from '../../lib/parsers/index.ts';

export const respondAs = async (
	outpuFormat: string,
	input: { ast: ASTJson; url: string },
): Promise<Response> => {
	let resp: Response;

	if (outpuFormat === 'rss') {
		const compactRssData = await rss.Rss({} as rss.RespStruct, input.url).fromAST(input.ast);
		console.log('chose rss: \n', compactRssData);
		resp = new Response(rss.Rss(compactRssData, input.url).toString(), {
			headers: { 'Content-Type': 'application/xml+rss' },
		});
	} else if (outpuFormat === 'atom') {
		const compactAtomData = await atom.Atom({} as atom.RespStruct, input.url).fromAST(input.ast);
		console.log('chose atom: \n', compactAtomData);
		resp = new Response(atom.Atom(compactAtomData, input.url).toString(), {
			headers: { 'Content-Type': 'application/xml+atom' },
		});
	} else if (outpuFormat === 'city') {
		const jsonData = await jsonfeed.JsonFeed({} as jsonfeed.RespStruct, input.url).fromAST(
			input.ast,
		) as jsonfeed.RespStruct;
		console.log('chose city: \n', jsonData);
		resp = json(computableToJson(await jsonfeed.JsonFeed(jsonData, input.url).toAST()), {});
	} //
	// add else if here
	//
	else if (outpuFormat.match('json')) {
		// anything mentioning json
		const jsonDatam = await jsonfeed.JsonFeed({} as jsonfeed.RespStruct, input.url).fromAST(
			input.ast,
		);
		console.log('chose json: \n', jsonDatam);
		resp = json(jsonDatam, {});
	} else {
		// default case - is city
		const jsonData = await jsonfeed.JsonFeed({} as jsonfeed.RespStruct, input.url).fromAST(
			input.ast,
		);
		resp = json(computableToJson(await jsonfeed.JsonFeed(jsonData, input.url).toAST()), {});
	}
	console.log();
	return resp;
};

export default respondAs;
