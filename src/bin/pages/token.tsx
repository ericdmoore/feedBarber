/** @jsx h */

import { h, Handler, jsx } from 'https://deno.land/x/sift@0.4.3/mod.ts';

/**
 * STATE LOOK UP
 * - for user or state
 * @param tokenType
 */
export const ListFeedsFortoken = (tokenType: 'User' | 'Temp'): Handler => async (req, pathParam) => {
	return jsx(<h1>{`Feeds For ${tokenType} Token`}</h1>);
};

export default ListFeedsFortoken;
