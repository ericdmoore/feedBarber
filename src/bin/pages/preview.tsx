/** @jsx h */

import { h, Handler, jsx } from 'https://deno.land/x/sift@0.4.3/mod.ts';

export const preview: Handler = async (req, pathParam) => {
	return jsx(h('h1', {}, ['Preview']));
};

export default preview;
