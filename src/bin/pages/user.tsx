/** @jsx h */
/** @jsxFrag Fragment */

import { Fragment, h, Handler, jsx } from 'https://deno.land/x/sift@0.4.3/mod.ts';

// pick out the user token
// look up the compositions saved by the user
// display the list to the screen as preview links

export const ListFeedsForUser: Handler = async (req, pathParam) => {
	return jsx(
		<>
			<h1>User</h1>

			<h3 style='margin: 1em 0 0 0;'>Feeds</h3>
			<p>show a list of feeds...</p>

			<h3 style='margin: 1em 0 0 0;'>Functions</h3>
			<p>show a list of feeds...</p>
		</>,
	);
};

export default ListFeedsForUser;
