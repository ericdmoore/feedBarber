/** @jsx h */

import { h, Handler, jsx } from 'https://deno.land/x/sift@0.4.3/mod.ts';

// pick out the user token
// look up the compositions saved by the user
// display the list to the screen as preview links

export const ListFeedsForUser: Handler = async (req, pathParam) => {
	return jsx(
		<h1>
			{'User'}
		</h1>,
	);
};

export default ListFeedsForUser;
