/** @jsx h */

import { h, Handler, jsx } from 'https://deno.land/x/sift@0.4.3/mod.ts';

export const createAcct: Handler = async (req, pathParam) => {
	return jsx(<h1>Create Account</h1>);
};

export default createAcct;
