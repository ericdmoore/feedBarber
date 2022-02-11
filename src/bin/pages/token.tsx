/** @jsx h */

import { h, Handler, jsx } from 'https://deno.land/x/sift@0.4.3/mod.ts';

export const ListFeedsFortoken = (tokenType: string): Handler =>
	async (req, pathParam) => {
		return jsx(<h1>{`Feeds For ${tokenType} Token`}</h1>);
	};

export default ListFeedsFortoken;
