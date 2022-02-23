/** @jsx h */

import type { Handler } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import { h, jsx } from 'https://deno.land/x/sift@0.4.3/mod.ts';

export const preview: Handler = async (req, pathParam) => {
	return jsx(
		<h1>The Preview </h1>
	)
};

export default preview;