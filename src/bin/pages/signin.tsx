/** @jsx h */

import { h, Handler, jsx } from 'https://deno.land/x/sift@0.4.3/mod.ts';

export const signin: Handler = async (req, pathParam) => {
	return jsx(h('h1', {}, ['Signin']));
};

export default signin;
